export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return new Response("Missing slug", { status: 400 });

  const row = await env.DB.prepare(`
    SELECT title, description, thumbnail_url, video_url
    FROM posts
    WHERE slug = ? AND published = 1
    LIMIT 1
  `).bind(slug).first();

  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}
