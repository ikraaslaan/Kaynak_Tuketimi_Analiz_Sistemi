/**
 * Verification Controller
 * 
 * Handles email verification flow for user registration:
 * 1. Initiate: Generates code and sends email
 * 2. Verify: Validates code and creates user account
 */

const verificationService = require('../services/verificationService');
const emailService = require('../services/emailService');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * POST /api/verification/initiate
 * 
 * Initiates the email verification process.
 * Generates a verification code and sends it to the user's email.
 * 
 * Request body:
 *   - username: string (required)
 *   - password: string (required)
 *   - email: string (required)
 * 
 * Response:
 *   - success: boolean
 *   - message: string
 */
exports.initiateVerification = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı, şifre ve e-posta adresi gereklidir.'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir e-posta adresi giriniz.'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı adı zaten kullanılıyor.'
      });
    }

    // Check if email already exists (if email field exists in User model)
    // Note: You may need to add email field to User model
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kayıtlı.'
      });
    }

    // Generate and store verification code
    const code = await verificationService.generateAndStoreCode(email, {
      username,
      password,
      email
    });

    // Send verification email
    await emailService.sendVerificationCode(email, code);

    res.status(200).json({
      success: true,
      message: 'Doğrulama kodu e-posta adresinize gönderildi.',
      email: email // Return email for frontend to use in verification step
    });

  } catch (error) {
    console.error('Verification initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Doğrulama kodu gönderilirken bir hata oluştu.'
    });
  }
};

/**
 * POST /api/verification/verify
 * 
 * Verifies the code and creates the user account.
 * 
 * Request body:
 *   - email: string (required)
 *   - code: string (required)
 * 
 * Response:
 *   - success: boolean
 *   - message: string
 *   - user?: object (user data if successful)
 */
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'E-posta adresi ve doğrulama kodu gereklidir.'
      });
    }

    // Validate code
    const validation = await verificationService.validateCode(email, code);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error || 'Geçersiz doğrulama kodu.'
      });
    }

    // Code is valid - create user account
    const { username, password } = validation.userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    // Note: If User model doesn't have email field, you may need to add it
    const user = await User.create({
      username,
      password: hashedPassword,
      email: email, // Add email if User model supports it
      role: 'kullanici' // Default role for new registrations
    });

    res.status(201).json({
      success: true,
      message: 'Hesabınız başarıyla oluşturuldu!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email || email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı adı veya e-posta adresi zaten kayıtlı.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Hesap oluşturulurken bir hata oluştu.'
    });
  }
};

/**
 * POST /api/verification/resend
 * 
 * Resends the verification code to the user's email.
 * 
 * Request body:
 *   - email: string (required)
 * 
 * Response:
 *   - success: boolean
 *   - message: string
 */
exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-posta adresi gereklidir.'
      });
    }

    // Get stored data
    const stored = verificationService.getStoredData(email);

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: 'Aktif bir doğrulama kodu bulunamadı. Lütfen kayıt işlemini tekrar başlatın.'
      });
    }

    // Resend the same code
    await emailService.sendVerificationCode(email, stored.code);

    res.status(200).json({
      success: true,
      message: 'Doğrulama kodu tekrar gönderildi.'
    });

  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kod gönderilirken bir hata oluştu.'
    });
  }
};

