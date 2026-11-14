/**
 * CMS routes the partner portal may call through /api/portal (FE-06), with their methods. Anything else is
 * refused, so a signed-in partner's cookie can't be used to reach other CMS routes through the website.
 */
export const PORTAL_ROUTES = [
  ['GET', /^tk\/v1\/my-submissions$/],
  ['PATCH', /^tk\/v1\/my-submissions\/(advisory|report)\/\d+$/],
  ['POST', /^tk\/v1\/my-submissions\/(advisory|report)\/\d+\/withdraw$/],
  ['POST', /^tk\/v1\/my-submissions\/report\/\d+\/documents$/],
  ['DELETE', /^tk\/v1\/my-submissions\/report\/\d+\/documents$/],
  ['GET', /^tk\/v1\/organization-status$/],
  ['POST', /^wp\/v2\/tk_alert$/],
  ['POST', /^wp\/v2\/tk_report$/],
  ['POST', /^wp\/v2\/media$/],
  ['POST', /^karamoja\/v1\/portal\/upload-ticket$/],
  ['GET', /^karamoja\/v1\/portal\/me$/],
];

/** May this method + route be forwarded? */
export function portalRouteAllowed(method, route) {
  const r = String(route || '');
  if (r.includes('..') || r.includes('//') || /[?#]/.test(r)) return false;
  return PORTAL_ROUTES.some(([m, re]) => m === String(method || '').toUpperCase() && re.test(r));
}
