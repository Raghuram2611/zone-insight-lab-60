import Cookies from 'js-cookie';

interface AuthUser {
  username: string;
  role: 'user' | 'admin';
  expiresAt: number;
}

export const AUTH_COOKIE_NAME = 'zone_insight_auth';
const COOKIE_EXPIRY_HOURS = 1;

export const setAuthCookie = (username: string, role: 'user' | 'admin') => {
  const expiresAt = Date.now() + COOKIE_EXPIRY_HOURS * 60 * 60 * 1000; // 1 hour from now
  const userData: AuthUser = {
    username,
    role,
    expiresAt
  };
  
  Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(userData), {
    expires: COOKIE_EXPIRY_HOURS/24, // Convert hours to days for js-cookie
    sameSite: 'strict',
    secure: window.location.protocol === 'https:'
  });

  return userData;
};

export const getAuthCookie = (): AuthUser | null => {
  const cookie = Cookies.get(AUTH_COOKIE_NAME);
  if (!cookie) return null;

  try {
    const userData: AuthUser = JSON.parse(cookie);
    
    // Check if the cookie has expired
    if (userData.expiresAt < Date.now()) {
      removeAuthCookie();
      return null;
    }

    return userData;
  } catch {
    removeAuthCookie();
    return null;
  }
};

export const removeAuthCookie = () => {
  Cookies.remove(AUTH_COOKIE_NAME);
};