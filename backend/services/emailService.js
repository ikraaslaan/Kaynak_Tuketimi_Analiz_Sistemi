// backend/services/emailService.js

const nodemailer = require('nodemailer');

const USER_EMAIL = '23frontend23@gmail.com'; 
const APP_PASSWORD = 'lqobohztvxyhqnkt'; // Google Uygulama Şifreniz

// 💡 GÜNCELLENMİŞ AYARLAR (Senin ayarların aynen korundu)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 465, 
    secure: true, 
    auth: {
        user: USER_EMAIL,
        pass: APP_PASSWORD,
    },
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000 
});

// 1. FONKSİYON: DOĞRULAMA KODU GÖNDER (Senin kodun)
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

    return sendWithTimeout(mailOptions);
};

// ✨ 2. FONKSİYON: KESİNTİ BİLDİRİMİ GÖNDER (YENİ EKLENDİ)
const sendOutageNotification = async (email, details) => {
    console.log(`📧 Kesinti bildirimi gönderiliyor: ${email}`);

    const mailOptions = {
        from: `"Kentsel Tüketim Analizi" <${USER_EMAIL}>`,
        to: email,
        subject: `⚠️ Planlı Kesinti Bildirimi: ${details.mahalle}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #fee2e2; border-radius: 8px; background-color: #fffafa;">
                <h2 style="color: #dc2626;">Planlı Kesinti Bildirimi</h2>
                <p>Sayın Abonemiz,</p>
                <p>Kayıtlı olduğunuz <strong>${details.mahalle}</strong> mahallesinde planlı bir çalışma yapılacaktır.</p>
                
                <div style="background-color: #fff; padding: 15px; border-radius: 4px; border: 1px solid #fecaca; margin: 20px 0;">
                    <p><strong>📍 Mahalle:</strong> ${details.mahalle}</p>
                    <p><strong>⚡ Kaynak:</strong> ${details.kaynak}</p>
                    <p><strong>🕒 Başlangıç:</strong> ${details.baslangic}</p>
                    <p><strong>🕒 Bitiş:</strong> ${details.bitis}</p>
                    <p><strong>📝 Açıklama:</strong> ${details.aciklama}</p>
                </div>
                
                <p style="font-size: 12px; color: #666;">Bu otomatik bir bilgilendirme mesajıdır.</p>
            </div>
        `,
    };

    return sendWithTimeout(mailOptions);
};

// YARDIMCI FONKSİYON: Timeout Kontrolü (Senin yazdığın mantık)
const sendWithTimeout = (mailOptions, timeoutMs = 8000) => {
    return Promise.race([
        (async () => {
            try {
                const info = await transporter.sendMail(mailOptions);
                console.log('✅ E-posta başarıyla gönderildi ID:', info.messageId);
                return true;
            } catch (error) {
                console.error('❌ E-posta Gönderme Hatası:', error.message);
                throw error;
            }
        })(),
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('E-posta gönderimi zaman aşımına uğradı.'));
            }, timeoutMs);
        })
    ]);
};

// İki fonksiyonu da dışarı açıyoruz
module.exports = {
    sendVerificationCode,
    sendOutageNotification
};