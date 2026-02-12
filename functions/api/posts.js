export async function onRequestGet({ env }) {
  // kalau DB belum dibinding, ini bakal error 500
  const { results } = await env.DB.prepare(`
    SELECT title, slug, thumbnail_url
    FROM posts
    WHERE published = 1
    ORDER BY published_at DESC, created_at DESC
  `).all();

  return Response.json(results);
}
