import passport from 'passport'
import { Strategy as kakaoStrategy } from 'passport-kakao'
import { prisma } from '../utils/prisma.utils.js'
import AuthService from '../services/auth.service.js'

const authService = new AuthService();
passport.use(
    new kakaoStrategy(
      {
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: process.env.KAKAO_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try{
            // 유저가 있는지 확인
            // 유저가 있다면 그대로 반환
            // 유저가 없으면 데이터 생성 후 반환
        }catch(err){
            console.error('Kakao login error:', err);
            done(err, null);
        }
      }
    ))