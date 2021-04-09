// Function to add authorization header to HTTP-requests
function authHeader() {
  // This might need to change depending on how tokens are handled in the frontend
  const token = localStorage.getItem('gutentag-accesstoken');

  if (token) {
    return { Authorization: 'Bearer ' + token};
  }
  return {};
}

export default authHeader;
