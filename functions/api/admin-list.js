function requireAdmin(request, env) {
  // MODE B (sementara): uncomment ini dan set password
  // const hardcoded = "12345";
  // if ((request.headers.get("x-admin-password") || "") !== hardcoded) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  // MODE A (recommended): env var
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
    SELECT id, title, slug, thumbnail_url, video_url, description,
           published, created_at, updated_at, published_at
    FROM posts
    ORDER BY updated_at DESC, created_at DESC
  `).all();

  return Response.json(results);
}
