import { Resend } from 'resend';
import { RESEND_API_KEY } from '../constants/env.constant.js';

const resend = new Resend(RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: 'hello@peopletophoto.site',
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
