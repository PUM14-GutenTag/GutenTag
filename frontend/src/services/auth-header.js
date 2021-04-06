// Function to add authorization header to HTTP-requests
export default function authHeader(refresh = false) {
  // This might need to change depending on how tokens are handled in the frontend
  const token = localStorage.getItem(`gutentag-${refresh ? 'refresh' : 'access'}token`);
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

module.exports = authHeader;
