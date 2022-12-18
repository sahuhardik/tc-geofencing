import Cookie from 'js-cookie';
import SSRCookie from 'cookie';
import { AUTH_CRED, TOKEN } from './constants';

export function setAuthCredentials(token: string, permissions: any) {
  Cookie.set(AUTH_CRED, JSON.stringify({ token, permissions }));
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
    return JSON.parse(authCred);
  }
  return { token: null };
}

export function parseSSRCookie(context: any) {
  return SSRCookie.parse(context.req.headers.cookie ?? '');
}

export function isAuthenticated(_cookies: any) {
  return !!_cookies[TOKEN];
}
