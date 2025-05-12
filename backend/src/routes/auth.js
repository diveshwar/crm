const express = require('express');
const router = express.Router();
const { passport, generateToken } = require('../config/passport');
const { OAuth2Client } = require('google-auth-library');
const Customer = require('../models/Customer');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Route to initiate Google OAuth login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route for Google OAuth
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate JWT
    const token = generateToken(req.user);
    res.json({ token });
  }
);

// Logout route (optional, as JWTs are stateless)
router.get('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/google - Accepts Google id_token, returns backend JWT
router.post('/google', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }
  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // Find or create user in your DB (Customer model)
    let user = await Customer.findOne({ where: { email: payload.email } });
    if (!user) {
      user = await Customer.create({
        email: payload.email,
        name: payload.name,
        // Optionally add more fields from payload
      });
    }
    // Generate backend JWT
    const jwt = generateToken(user);
    res.json({ jwt });
  } catch (err) {
    console.error('Google token verification failed:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

module.exports = router; 