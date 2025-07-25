// Kakao 로그인 후 Firebase Custom Token 발급 예시 코드
// 실제 배포 시 환경변수 및 보안에 유의하세요.

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
// import { Request, Response } from 'firebase-functions';


admin.initializeApp();

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID!;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI!;

export const kakaoLogin = functions.https.onRequest(async (req: any, res: any) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // 1. 카카오 토큰 요청
    const tokenRes = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: KAKAO_CLIENT_ID,
          redirect_uri: KAKAO_REDIRECT_URI,
          code,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    const { access_token } = tokenRes.data;

    // 2. 카카오 사용자 정보 요청
    const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const kakaoUser = userRes.data;
    const kakaoUid = `kakao:${kakaoUser.id}`;
    const email = kakaoUser.kakao_account?.email || '';
    const name = kakaoUser.properties?.nickname || '';
    const photo = kakaoUser.properties?.profile_image || '';

    // 3. Firebase Custom Token 발급
    await admin.auth().updateUser(kakaoUid, {
      displayName: name,
      photoURL: photo,
      email: email || undefined,
    }).catch(async (err: any) => {
      if (err.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          uid: kakaoUid,
          displayName: name,
          photoURL: photo,
          email: email || undefined,
        });
      } else {
        throw err;
      }
    });

    const firebaseToken = await admin.auth().createCustomToken(kakaoUid);
    res.json({ firebaseToken });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}); 