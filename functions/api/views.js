export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return new Response("Missing slug", { status: 400 });

  // GET = cek views aja (debug)
  if (request.method === "GET") {
    const row = await env.DB.prepare(`
      SELECT views FROM posts WHERE slug = ? AND published = 1 LIMIT 1
    `).bind(slug).first();

    return Response.json({ ok: true, views: row?.views ?? 0 });
  }

  // POST = increment beneran
  if (request.method === "POST") {
    await env.DB.prepare(`
      UPDATE posts
      SET views = views + 1
      WHERE slug = ? AND published = 1
    `).bind(slug).run();

    const row = await env.DB.prepare(`
      SELECT views FROM posts WHERE slug = ? AND published = 1 LIMIT 1
    `).bind(slug).first();

    return Response.json({ ok: true, views: row?.views ?? 0 });
  }

  return new Response("Method not allowed", { status: 405 });
}
