// Les fichiers de fabrication du site ne sont pas publics : on renvoie la page 404.
export async function onRequest({ env, request }) {
  const r = await env.ASSETS.fetch(new URL("/404.html", request.url));
  return new Response(r.body, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
