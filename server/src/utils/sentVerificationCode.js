import { generateVerificationEmailMessage } from './emailTemplates.js';
import { sendEmail } from './sentEmail.js';

export async function sentVerificationEmail(email, verificationCode) {
    const message = generateVerificationEmailMessage(verificationCode);

    await sendEmail({
        to: email,
        subject: 'Verify Your Account',
        message,
    });
}
