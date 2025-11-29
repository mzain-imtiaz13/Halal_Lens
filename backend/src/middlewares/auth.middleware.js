// middleware/firebaseAuth.js
const { auth } = require('../config/firebaseAdmin.config');
const { R4XX } = require('../Responses');

const firebaseAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Expect "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return R4XX(res, 401, 'No auth token provided.');
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Verify Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);

    // Attach user info to req (you can customize what you store)
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      // customClaims: decodedToken, // if you want whole payload
    };

    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    return R4XX(res, 401, 'Invalid or expired auth token.');
  }
};

module.exports = firebaseAuth;
