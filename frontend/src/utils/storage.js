const TOKEN_KEY = 'lifelink_token';
const REMEMBER_KEY = 'lifelink_remember';

export const getRememberMe = () => localStorage.getItem(REMEMBER_KEY) === 'true';

export const setRememberMe = (remember) => {
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
};

const getStore = () => (getRememberMe() ? localStorage : sessionStorage);

export const getToken = () => getStore().getItem(TOKEN_KEY);

export const setToken = (token) => {
  const remember = getRememberMe();
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
};
