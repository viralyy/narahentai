function requireAdmin(request, env) {
  const pass = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || pass !== env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export async function onRequestGet({ request, env }) {
  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const { results } = await env.DB.prepare(`
    SELECT id, title, slug, description, thumbnail_url, video_url,
           published, created_at, updated_at, published_at
    FROM posts
    ORDER BY updated_at DESC, created_at DESC
  `).all();

  return Response.json(results);
}
