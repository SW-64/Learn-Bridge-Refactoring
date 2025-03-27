import FeedbackRepository from '../repositories/feedback.repository.js';

class FeedbackService {
  feedbackRepository = new FeedbackRepository();
}

export default FeedbackService;
