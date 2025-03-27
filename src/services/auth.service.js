import AuthRepository from '../repositories/auth.repository.js';

class AuthService {
  authRepository = new AuthRepository();
}

export default AuthService;
