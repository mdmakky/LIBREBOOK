function getEmailStyles() {
    return `
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 40px; }
        h1 { color: #333; text-align: center; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; margin: 15px 0; }
        .code-box { background-color: #f0f0f0; border-left: 4px solid #007bff; padding: 15px; margin: 25px 0; text-align: center; }
        .code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 2px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
    `;
}

function generateEmailTemplate(title, content, additionalStyles = '') {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                ${getEmailStyles()}
                ${additionalStyles}
            </style>
        </head>
        <body>
            <div class="container">
                ${content}
                <div class="footer">
                    <p>Best regards,<br/>The LibreBook Team</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function generateVerificationEmailMessage(verificationCode) {
    const content = `
                <h1>🔐 Verify Your Account</h1>
                <p>Thank you for registering with us! Please use the following verification code to verify your account:</p>
                <div class="code-box">
                    <div class="code">${verificationCode}</div>
                </div>
                <p><strong>⏱️ Note:</strong> This code will expire in 15 minutes. If you did not request this verification, please ignore this email.</p>
    `;
    return generateEmailTemplate('Verify Your Account', content);
}

export function generateForgetPasswordEmailTemplate(resetToken) {
    const additionalStyles = `
                .reset-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 30px; margin: 25px 0; }
                .reset-section h2 { color: #ffffff; margin: 0 0 15px 0; font-size: 18px; }
                .reset-section p { color: #f0f0f0; margin: 10px 0; }
                .cta-button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin-top: 15px; font-weight: bold; }
                .code-box { background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-left: 4px solid #667eea; padding: 15px; margin: 25px 0; }
                .code { color: #667eea; font-size: 24px; font-weight: bold; letter-spacing: 1px; word-break: break-all; }
                @media (max-width: 600px) {
                    .code { font-size: 18px; letter-spacing: 0.5px; }
                    .code-box { padding: 12px; margin: 15px 0; }
                }
    `;
    const content = `
                <h1>🔐 Reset Your Password</h1>
                <div class="reset-section">
                    <h2>Secure Password Reset</h2>
                    <p>We received a request to reset your password. Use the code below to verify:</p>
                </div>
                <div class="code-box">
                    <div class="code">${resetToken}</div>
                </div>
                <p><strong>⏱️ Security Note:</strong> This code expires in 15 minutes for your protection. If you didn't request this, simply ignore this email.</p>
    `;
    return generateEmailTemplate('Reset Your Password', content, additionalStyles);
}
