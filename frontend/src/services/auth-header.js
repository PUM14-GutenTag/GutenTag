// Function to add authorization header to HTTP-requests
function authHeader(refresh = false) {
  // This might need to change depending on how tokens are handled in the frontend
  const token = localStorage.getItem(`gutentag-${refresh ? 'refresh' : 'access'}token`);
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export default authHeader;
