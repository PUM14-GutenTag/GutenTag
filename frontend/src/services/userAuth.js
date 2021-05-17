// Check for access token in localStorage.
const hasAccessToken = () => {
  const token = localStorage.getItem('gutentag-accesstoken');
  return token !== 'null' && token !== null;
};

// Store access in localStorage.
const setAccessToken = (accessToken) => {
  localStorage.setItem('gutentag-accesstoken', accessToken);
};

// Store refresh token in localStorage.
const setRefreshToken = (refreshToken) => {
  localStorage.setItem('gutentag-refreshtoken', refreshToken);
};

// Clear access token and refresh token from localStorage.
const clearTokens = () => {
  localStorage.setItem('gutentag-accesstoken', null);
  localStorage.setItem('gutentag-refreshtoken', null);
};

const userAuth = {
  hasAccessToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
};

export default userAuth;
