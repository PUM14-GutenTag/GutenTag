// Function to add authorization header to HTTP-requests
export default function authHeader() {
  // This might need to change depending on how tokens are handled in the frontend
  const user = JSON.parse(localStorage.getItem('gutentag-accesstoken'));
  if (user) {
    return { Authorization: `Bearer ${user}` };
  }
  return {};
}

module.exports = authHeader;
