export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(`
    SELECT title, slug, thumbnail_url, published_at, created_at
    FROM posts
    WHERE published = 1
    ORDER BY COALESCE(published_at, created_at) DESC
  `).all();

  return Response.json(results, {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
