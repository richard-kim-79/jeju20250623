'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SocialLogin from '../components/SocialLogin';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // 비밀번호 정책 검증
  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    return {
      isValid: Object.values(checks).every(Boolean),
      checks
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 클라이언트 측 비밀번호 검증
    if (!passwordValidation.isValid) {
      setError('비밀번호가 정책을 만족하지 않습니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3004/test-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('회원가입이 완료되었습니다! 로그인해주세요.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLoginSuccess = (token: string, user: any) => {
    setSuccess('소셜 로그인이 완료되었습니다!');
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const handleSocialLoginError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            제주 SNS 계정 만들기
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            또는{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              기존 계정으로 로그인
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                사용자명
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="사용자명"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                이메일 주소
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* 비밀번호 정책 힌트 */}
          {password && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">비밀번호 정책:</p>
              <ul className="text-xs space-y-1">
                <li className={`flex items-center ${passwordValidation.checks.length ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordValidation.checks.length ? '✓' : '✗'}</span>
                  최소 8자 이상
                </li>
                <li className={`flex items-center ${passwordValidation.checks.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordValidation.checks.lowercase ? '✓' : '✗'}</span>
                  소문자 포함
                </li>
                <li className={`flex items-center ${passwordValidation.checks.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordValidation.checks.uppercase ? '✓' : '✗'}</span>
                  대문자 포함
                </li>
                <li className={`flex items-center ${passwordValidation.checks.number ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordValidation.checks.number ? '✓' : '✗'}</span>
                  숫자 포함
                </li>
                <li className={`flex items-center ${passwordValidation.checks.special ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{passwordValidation.checks.special ? '✓' : '✗'}</span>
                  특수문자 포함 (!@#$%^&* 등)
                </li>
              </ul>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !passwordValidation.isValid}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </div>
        </form>

        {/* 소셜 로그인 */}
        <SocialLogin 
          onSuccess={handleSocialLoginSuccess}
          onError={handleSocialLoginError}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
      </div>
    </div>
  );
} 