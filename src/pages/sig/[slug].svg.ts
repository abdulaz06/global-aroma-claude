import type { APIRoute, GetStaticPaths } from 'astro';
import { scents, scentBySlug } from '../../lib/library';
import { signatureSVG } from '../../lib/signature';

export const getStaticPaths: GetStaticPaths = () => scents.map((s) => ({ params: { slug: s.slug } }));

export const GET: APIRoute = ({ params }) => {
  const s = scentBySlug[params.slug as string];
  return new Response(signatureSVG(s, { size: 400 }), { headers: { 'Content-Type': 'image/svg+xml' } });
};
