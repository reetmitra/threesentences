/**
 * Supabase auth redirects that land on the app's scheme.
 * The client uses the PKCE flow, so a reset email brings the user back with
 * threesentences://?code=… (or #error=…). The code only redeems against a
 * verifier known to this phone and Supabase (never in the email or URL),
 * which stops a crafted link from signing this phone into another account.
 * Parsed by hand: RN's URLSearchParams differs from the web one.
 */

export type AuthLink = { kind: 'code'; code: string } | { kind: 'error'; message: string };

export const LINK_FAILED = "That link didn't work. Request a new one on this phone and open it here.";
const EXPIRED = 'That link has expired or was already used. Request a new one.';

function readParams(url: string): Map<string, string> {
  const params = new Map<string, string>();
  const parts = url.split(/[?#]/).slice(1); // query and hash both carry params
  for (const part of parts) {
    for (const pair of part.split('&')) {
      const eq = pair.indexOf('=');
      const key = eq === -1 ? pair : pair.slice(0, eq);
      const value = eq === -1 ? '' : pair.slice(eq + 1);
      if (key) params.set(decodeURIComponent(key), decodeURIComponent(value.replace(/\+/g, ' ')));
    }
  }
  return params;
}

export function parseAuthLink(url: string): AuthLink | null {
  let p: Map<string, string>;
  try {
    p = readParams(url);
  } catch {
    return null; // malformed percent-encoding
  }
  if (p.has('error') || p.has('error_code')) {
    // Our own copy only: the URL's text can come from anything that opens our scheme.
    return { kind: 'error', message: p.get('error_code') === 'otp_expired' ? EXPIRED : LINK_FAILED };
  }
  const code = p.get('code');
  if (code) return { kind: 'code', code };
  // Raw-token recovery links (emails sent before PKCE) are never trusted; say so instead of ignoring.
  if (p.get('type') === 'recovery') return { kind: 'error', message: LINK_FAILED };
  return null;
}
