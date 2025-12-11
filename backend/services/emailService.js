// backend/services/emailService.js

const nodemailer = require('nodemailer');

const USER_EMAIL = '23frontend23@gmail.com'; 
const APP_PASSWORD = 'lqobohztvxyhqnkt'; // Google Uygulama Şifreniz

// 💡 GÜNCELLENMİŞ AYARLAR (Daha kararlı bağlantı için)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // service: 'gmail' yerine direkt host adresi
    port: 465, // Güvenli port (SSL)
    secure: true, // SSL kullanımı açık
    auth: {
        user: USER_EMAIL,
        pass: APP_PASSWORD,
    },
    // Bağlantı zaman aşımı ayarları (Takılmayı önler)
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000 
});

const sendVerificationCode = async (email, code) => {
    console.log(`📧 E-posta gönderimi başlatılıyor: ${email}`);

    const mailOptions = {
        from: `"Kentsel Tüketim Analizi" <${USER_EMAIL}>`,
        to: email,
        subject: 'E-posta Doğrulama Kodunuz',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #059669;">E-posta Doğrulama</h2>
                <p>Merhaba, kayıt işlemini tamamlamak için aşağıdaki kodu kullanın:</p>
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 4px; font-size: 24px; text-align: center; margin: 20px 0; border: 1px dashed #34d399;">
                    <strong>${code}</strong>
                </div>
                <p>Bu kod 10 dakika geçerlidir.</p>
            </div>
        `,
    };

    // Create a promise with timeout
    const sendWithTimeout = (timeoutMs = 8000) => {
        return Promise.race([
            // Actual email sending
            (async () => {
                try {
                    // Skip verify() to avoid hanging - directly send email
                    // verify() can hang on network issues, so we'll let sendMail handle connection
                    const info = await transporter.sendMail(mailOptions);
                    console.log('✅ E-posta başarıyla gönderildi ID:', info.messageId);
                    return true;
                } catch (error) {
                    console.error('❌ E-posta Gönderme Hatası:', error.message);
                    throw error;
                }
            })(),
            // Timeout promise
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('E-posta gönderimi zaman aşımına uğradı. Lütfen tekrar deneyin.'));
                }, timeoutMs);
            })
        ]);
    };

    try {
        const result = await sendWithTimeout(8000); // 8 second timeout
        return result;
    } catch (error) {
        console.error('❌ E-posta Gönderme Hatası Detayı:', error);
        // In development, log the code to console instead of failing
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            console.log('\n📧 ===== DEVELOPMENT MODE: EMAIL CODE =====');
            console.log(`To: ${email}`);
            console.log(`Code: ${code}`);
            console.log('==========================================\n');
            // Return true in dev mode so the flow continues
            return true;
        }
        // In production, throw the error
        throw new Error(`E-posta servisi hatası: ${error.message}`);
    }
};

module.exports = {
    sendVerificationCode
};