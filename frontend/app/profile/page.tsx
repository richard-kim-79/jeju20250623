'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, BarChart3, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ApiKey {
  id: number;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  isActive: boolean;
  planId?: number;
  plan?: {
    name: string;
    description: string;
    monthlyLimit: number;
    dailyLimit: number;
    rateLimit: number;
    price: number;
  };
  usage?: {
    daily: number;
    monthly: number;
    total: number;
  };
}

interface ApiKeyPlan {
  id: number;
  name: string;
  description: string;
  monthlyLimit: number;
  dailyLimit: number;
  rateLimit: number;
  price: number;
  features: any;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiPlans, setApiPlans] = useState<ApiKeyPlan[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    router.replace('/login');
    return null;
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchApiKeys();
    fetchApiPlans();
  }, [router]);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys);
      } else {
        setError('API 키 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    }
  };

  const fetchApiPlans = async () => {
    try {
      const response = await fetch('http://localhost:3000/api-keys/plans');
      if (response.ok) {
        const data = await response.json();
        setApiPlans(data);
      }
    } catch (err) {
      console.error('API 플랜 조회 실패:', err);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('API 키 이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: newKeyName,
          planId: selectedPlan 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewApiKey(data.apiKey);
        setShowNewKey(true);
        setNewKeyName('');
        setSelectedPlan(null);
        setSuccess('API 키가 성공적으로 발급되었습니다.');
        fetchApiKeys();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'API 키 발급에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const revokeApiKey = async (keyId: number) => {
    if (!confirm('정말로 이 API 키를 폐기하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('API 키가 성공적으로 폐기되었습니다.');
        fetchApiKeys();
      } else {
        setError('API 키 폐기에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('클립보드에 복사되었습니다.');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center pt-16">
      <div className="bg-[#181818] shadow-2xl rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-3 flex items-center justify-center text-3xl">
            {user.username[0]}
          </div>
          <div className="text-xl font-bold mb-1">{user.username}</div>
          <div className="text-gray-400 text-sm mb-2">{user.email}</div>
          <button onClick={logout} className="w-full bg-[#1d9bf0] hover:bg-[#007AFF] text-white font-semibold py-2 rounded transition-colors mt-2">로그아웃</button>
        </div>
        <hr className="my-6 border-gray-700" />
        <div className="text-left">
          <div className="font-semibold mb-2">내 글</div>
          <div className="bg-gray-800 rounded p-3 text-gray-300 text-sm mb-2">(목업) 제주 올레길 추천 코스</div>
          <div className="bg-gray-800 rounded p-3 text-gray-300 text-sm mb-2">(목업) 제주 맛집 리스트</div>
          <div className="font-semibold mt-6 mb-2">내 활동</div>
          <div className="bg-gray-800 rounded p-3 text-gray-300 text-sm mb-2">(목업) 댓글 3개, 좋아요 5개</div>
        </div>
      </div>
    </div>
  );
} 