import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import { AUTH_CRED, TOKEN } from './constants';

export function setAuthCredentials(token: string) {
  Cookie.set(AUTH_CRED, token);
}

export function getAuthCredentials(context?: any): {
  token: string | null;
} {
  let authCred;
  if (context) {
    authCred = parseSSRCookie(context)[AUTH_CRED];
  } else {
    authCred = Cookie.get(AUTH_CRED);
  }
  if (authCred) {
    return { token: authCred };
  }
  return { token: null };
}

export function parseSSRCookie(context: any) {
  return SSRCookie.parse(context.req.headers.cookie ?? '');
}

export function isAuthenticated(_cookies: any) {
  return !!_cookies[TOKEN];
}
