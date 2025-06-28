'use client';

import { useState } from 'react';
import { signInWithGoogle } from '../../lib/firebase';
import { FcGoogle } from 'react-icons/fc';

interface SocialLoginProps {
  onSuccess: (token: string, user: any) => void;
  onError: (error: string) => void;
}

export default function SocialLogin({ onSuccess, onError }: SocialLoginProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      
      // 백엔드에 토큰 전송
      const response = await fetch('http://localhost:3000/auth/social-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        onSuccess(data.access_token, data.user);
      } else {
        const errorData = await response.json();
        onError(errorData.message || '소셜 로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('소셜 로그인 오류:', error);
      onError('소셜 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FcGoogle className="w-5 h-5 mr-2" />
        {loading ? '로그인 중...' : 'Google로 계속하기'}
      </button>

      <div className="text-xs text-gray-500 text-center">
        소셜 로그인을 통해 간편하게 가입하고 로그인할 수 있습니다.
      </div>
    </div>
  );
} 