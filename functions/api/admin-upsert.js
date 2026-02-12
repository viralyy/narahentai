function requireAdmin(request, env) {
  const pass = request.headers.get("x-admin-password") || "";
  if (!env.ADMIN_PASSWORD || pass !== env.ADMIN_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function onRequestPost({ request, env }) {
  try {
    const deny = requireAdmin(request, env);
    if (deny) return deny;

    const body = await request.json();

    const {
      id = null,
      title,
      slug = "",
      description = "",
      thumbnail_url = "",
      video_url,
      duration_minutes = 0,
      published = false
    } = body;

    if (!title || !video_url) {
      return new Response("title & video_url wajib", { status: 400 });
    }

    const finalSlug = slugify(slug || title);
    const now = new Date().toISOString();
    const pub = published ? 1 : 0;
    const dur = Number(duration_minutes) || 0;

    if (id) {
      await env.DB.prepare(`
        UPDATE posts
        SET title = ?, slug = ?, description = ?, thumbnail_url = ?, video_url = ?, duration_minutes = ?,
            published = ?, updated_at = ?,
            published_at = CASE
              WHEN ? = 1 AND published_at IS NULL THEN ?
              WHEN ? = 0 THEN NULL
              ELSE published_at
            END
        WHERE id = ?
      `).bind(
        title, finalSlug, description, thumbnail_url, video_url, dur,
        pub, now,
        pub, now,
        pub,
        id
      ).run();

      return Response.json({ ok: true });
    } else {
      const publishedAt = pub ? now : null;

      await env.DB.prepare(`
        INSERT INTO posts (title, slug, description, thumbnail_url, video_url, duration_minutes, published, created_at, updated_at, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        title, finalSlug, description, thumbnail_url, video_url, dur,
        pub, now, now, publishedAt
      ).run();

      return Response.json({ ok: true });
    }
  } catch (e) {
    return new Response("Server error: " + e.message, { status: 500 });
  }
}
