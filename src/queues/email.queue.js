import Queue from 'bull';

const emailQueue = new Queue('emailQueue', 'redis://127.0.0.1:6379');

export default emailQueue;
