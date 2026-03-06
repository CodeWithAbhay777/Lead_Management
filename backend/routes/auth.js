const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Login route - admin password check
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    // Check if password matches admin password from env
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Generate JWT token with 1 day expiry
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie with token (1 day expiry)
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });

    res.json({ 
      success: true, 
      message: 'Login successful',
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ 
    success: true, 
    message: 'Logout successful' 
  });
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token found' 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({ 
      success: true, 
      message: 'Token is valid' 
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
});

module.exports = router;
