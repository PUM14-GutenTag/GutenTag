// Check for access token in localStorage.
const hasAccessToken = () => {
  const token = localStorage.getItem('gutentag-accesstoken');
  return token !== 'null' && token !== null;
};

// Store access and refresh tokens in localStorage.
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('gutentag-accesstoken', accessToken);
  localStorage.setItem('gutentag-refreshtoken', refreshToken);
};

// Clear access token and refresh token from localStorage.
const clearTokens = () => {
  localStorage.setItem('gutentag-accesstoken', null);
  localStorage.setItem('gutentag-refreshtoken', null);
};

const userAuth = {
  hasAccessToken,
  setTokens,
  clearTokens,
};

export default userAuth;
