const { OAuth2Client } = require('google-auth-library');

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Verify Google ID token and extract user information
   * @param {string} token - Google ID token
   * @returns {Promise<Object>} User information from Google
   */
  async verifyGoogleToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        firstName: payload.given_name,
        lastName: payload.family_name,
        fullName: payload.name,
        picture: payload.picture,
        locale: payload.locale
      };
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Generate a username from Google profile information
   * @param {Object} googleProfile - Google user profile
   * @returns {string} Generated username
   */
  generateUsername(googleProfile) {
    let baseUsername = '';
    
    if (googleProfile.firstName) {
      baseUsername = googleProfile.firstName.toLowerCase();
    } else {
      baseUsername = googleProfile.email.split('@')[0];
    }
    
    // Remove any non-alphanumeric characters
    baseUsername = baseUsername.replace(/[^a-z0-9]/g, '');
    
    // Add random numbers to make it unique
    const randomSuffix = Math.floor(Math.random() * 10000);
    return `${baseUsername}${randomSuffix}`;
  }

  /**
   * Extract user data for registration from Google profile
   * @param {Object} googleProfile - Google user profile
   * @returns {Object} User data for registration
   */
  extractUserDataForRegistration(googleProfile) {
    return {
      email: googleProfile.email,
      username: this.generateUsername(googleProfile),
      email_verified: googleProfile.emailVerified,
      avatar_url: googleProfile.picture,
      first_name: googleProfile.firstName,
      last_name: googleProfile.lastName,
      google_id: googleProfile.googleId,
      provider: 'google'
    };
  }
}

module.exports = new GoogleAuthService();
