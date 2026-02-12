export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const qRaw = (url.searchParams.get("q") || "").trim();
  const q = qRaw.toLowerCase();
  const limit = 10;
  const offset = (page - 1) * limit;

  // Simple search: title/slug contains query
  const where = q
    ? `published = 1 AND (LOWER(title) LIKE ? OR LOWER(slug) LIKE ?)`
    : `published = 1`;

  const binds = q ? [`%${q}%`, `%${q}%`] : [];

  const totalRow = await env.DB
    .prepare(`SELECT COUNT(*) as c FROM posts WHERE ${where}`)
    .bind(...binds)
    .first();

  const total = totalRow?.c || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const { results } = await env.DB
    .prepare(`
      SELECT title, slug, thumbnail_url, duration_minutes, views, published_at, created_at
      FROM posts
      WHERE ${where}
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT ${limit} OFFSET ${offset}
    `)
    .bind(...binds)
    .all();

  return Response.json({
    page,
    totalPages,
    total,
    items: results
  });
}
