export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return new Response("Missing slug", { status: 400 });

  // increment view untuk published post saja
  await env.DB.prepare(`
    UPDATE posts
    SET views = views + 1, updated_at = datetime('now')
    WHERE slug = ? AND published = 1
  `).bind(slug).run();

  const row = await env.DB.prepare(`
    SELECT views FROM posts WHERE slug = ? AND published = 1 LIMIT 1
  `).bind(slug).first();

  return Response.json({ ok: true, views: row?.views ?? 0 });
}
