function requireAdmin(request, env) {
  // MODE B (sementara): uncomment ini dan set password
  // const hardcoded = "12345";
  // if ((request.headers.get("x-admin-password") || "") !== hardcoded) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  const pass = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || pass !== env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export async function onRequestPost({ request, env }) {
  const deny = requireAdmin(request, env);
  if (deny) return deny;

  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (!id) return new Response("Missing id", { status: 400 });

  await env.DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run();
  return Response.json({ ok: true });
}
