"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Input from './Input';

export default function AuthForm({ type }: { type: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (type === 'signup' && !username)) {
      setError('모든 필드를 입력해 주세요.');
      return;
    }
    setError('');
    // 실제 인증 API 연동은 추후 구현
    login({ username: type === 'login' ? '유저' : username, email });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#181818] shadow-2xl rounded-2xl p-8 w-full max-w-sm mx-auto mt-12 text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">{type === 'login' ? '로그인' : '회원가입'}</h2>
      {type === 'signup' && (
        <div className="mb-4">
          <label className="block mb-1 text-sm" htmlFor="username">닉네임</label>
          <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="닉네임" />
        </div>
      )}
      <div className="mb-4">
        <label className="block mb-1 text-sm" htmlFor="email">이메일</label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="이메일" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm" htmlFor="password">비밀번호</label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={type === 'login' ? 'current-password' : 'new-password'} placeholder="비밀번호" />
      </div>
      {error && <div className="text-red-400 mb-3 text-sm text-center">{error}</div>}
      <Button type="submit" className="w-full mt-2">{type === 'login' ? '로그인' : '회원가입'}</Button>
    </form>
  );
} 