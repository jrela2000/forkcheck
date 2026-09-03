import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const reviewId = body?.reviewId;
    if (!reviewId) return Response.json({ error: 'reviewId is required' }, { status: 400 });

    const review = await base44.entities.Review.get(reviewId);
    if (!review) return Response.json({ error: 'Review not found' }, { status: 404 });
    if (!review.video_url) return Response.json({ error: 'Review has no video' }, { status: 400 });

    // 1. Transcribe the uploaded video
    const transcription = await base44.asServiceRole.integrations.Core.TranscribeAudio({
      audio_url: review.video_url
    });

    // 2. Generate polished written summary + sentiment + highlight quote
    const prompt =
      'You are a restaurant review editor. Convert this spoken transcription into a polished 150-word written restaurant review. ' +
      'Preserve the reviewer\'s authentic voice. Extract an overall sentiment score from 1 to 5. Return JSON with fields: written_review, sentiment_score, highlight_quote.\n\n' +
      'Transcription:\n' + (transcription || '(empty)');

    const summary = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          written_review: { type: 'string' },
          sentiment_score: { type: 'number' },
          highlight_quote: { type: 'string' }
        },
        required: ['written_review', 'sentiment_score', 'highlight_quote']
      }
    });

    const updated = await base44.entities.Review.update(reviewId, {
      transcription_text: transcription || '',
      ai_generated_summary: summary?.written_review || '',
      sentiment_score: typeof summary?.sentiment_score === 'number' ? summary.sentiment_score : 3,
      highlight_quote: summary?.highlight_quote || ''
    });

    return Response.json({
      ok: true,
      review: {
        id: updated.id,
        transcription_text: updated.transcription_text,
        ai_generated_summary: updated.ai_generated_summary,
        sentiment_score: updated.sentiment_score,
        highlight_quote: updated.highlight_quote
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}