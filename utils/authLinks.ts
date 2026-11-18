/**
 * Supabase auth redirects that land on the app's scheme.
 * The client uses the PKCE flow, so a reset email brings the user back with
 * threesentences://?code=… (or #error=…). The code only works on the device
 * that asked for the reset, which is what stops a crafted link from signing
 * this phone into someone else's account.
 * Parsed by hand: RN's URLSearchParams differs from the web one.
 */

export type AuthLink = { kind: 'code'; code: string } | { kind: 'error'; message: string };

export const LINK_FAILED = "That link didn't work. Request a new one on this phone and open it here.";
const EXPIRED = 'That reset link has expired or was already used. Request a new one.';

function readParams(url: string): Map<string, string> {
  const params = new Map<string, string>();
  const parts = url.split(/[?#]/).slice(1); // query and hash both carry params
  for (const part of parts) {
    for (const pair of part.split('&')) {
      const [key, value = ''] = pair.split('=');
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
  return code ? { kind: 'code', code } : null;
}
