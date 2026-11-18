import { LINK_FAILED, parseAuthLink } from '@/utils/authLinks';

describe('parseAuthLink', () => {
  it('reads the one-time code a reset email returns with', () => {
    expect(parseAuthLink('threesentences://?code=4f1c2b9a-0e1d')).toEqual({ kind: 'code', code: '4f1c2b9a-0e1d' });
  });

  it('reads the code when the link kept its path', () => {
    expect(parseAuthLink('threesentences://reset-password?code=abc')).toEqual({ kind: 'code', code: 'abc' });
  });

  it('decodes a percent-encoded code', () => {
    expect(parseAuthLink('threesentences://?code=a%2Bb')).toEqual({ kind: 'code', code: 'a+b' });
  });

  it('never accepts raw session tokens; an old-style recovery link gets the failure message', () => {
    expect(
      parseAuthLink('threesentences://#access_token=at&refresh_token=rt&token_type=bearer&type=recovery'),
    ).toEqual({ kind: 'error', message: LINK_FAILED });
  });

  it('turns an expired link into our own message, never the URL text', () => {
    expect(
      parseAuthLink(
        'threesentences://#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
      ),
    ).toEqual({ kind: 'error', message: 'That link has expired or was already used. Request a new one.' });
  });

  it('keeps "=" inside a value and reads the scheme-only form', () => {
    expect(parseAuthLink('threesentences:?code=ab==')).toEqual({ kind: 'code', code: 'ab==' });
  });

  it('reads other errors from the query string with the generic message', () => {
    expect(parseAuthLink('threesentences://?error=server_error&error_description=boom')).toEqual({
      kind: 'error',
      message: LINK_FAILED,
    });
  });

  it('ignores ordinary deep links and an empty code', () => {
    expect(parseAuthLink('threesentences://')).toBeNull();
    expect(parseAuthLink('threesentences://chat/123')).toBeNull();
    expect(parseAuthLink('threesentences://?code=')).toBeNull();
  });

  it('does not throw on malformed percent-encoding', () => {
    expect(parseAuthLink('threesentences://?code=%E0%A4%A')).toBeNull();
  });
});
