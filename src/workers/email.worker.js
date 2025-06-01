import { Resend } from 'resend';
import emailQueue from '../queues/email.queue.js';
import { RESEND_API_KEY } from '../constants/env.constant.js';

const resend = new Resend(RESEND_API_KEY);

emailQueue.process(async (job) => {
  const { to, subject, html } = job.data;
  try {
    await resend.emails.send({
      from: 'hello@peopletophoto.site',
      to,
      subject,
      html,
    });

    console.log(`✅ 이메일 전송 완료: ${to}`);
  } catch (err) {
    console.error('이메일 전송 실패:', err);
  }
});
