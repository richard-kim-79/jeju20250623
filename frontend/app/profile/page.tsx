'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, BarChart3, TrendingUp, Calendar, Zap } from 'lucide-react';

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
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiPlans, setApiPlans] = useState<ApiKeyPlan[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

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
    <div className="max-w-6xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">내 프로필</h1>

        {/* API 키 관리 섹션 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            API 키 관리
          </h2>

          {/* 새 API 키 발급 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">새 API 키 발급</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="API 키 이름 (예: 제주 SNS API)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <select
                  value={selectedPlan || ''}
                  onChange={(e) => setSelectedPlan(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">플랜 선택 (선택사항)</option>
                  {apiPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}/월`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={generateApiKey}
                  disabled={loading}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? '발급 중...' : '발급'}
                </button>
              </div>
              {selectedPlan && (
                <div className="text-sm text-gray-600">
                  선택된 플랜: {apiPlans.find(p => p.id === selectedPlan)?.description}
                </div>
              )}
            </div>
          </div>

          {/* 새로 발급된 API 키 표시 */}
          {showNewKey && newApiKey && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-md font-medium text-green-900 mb-3">새로 발급된 API 키</h3>
              <p className="text-sm text-green-700 mb-3">
                이 키는 한 번만 표시됩니다. 안전한 곳에 저장해주세요.
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white border border-green-300 rounded px-3 py-2 font-mono text-sm">
                  {newApiKey}
                </div>
                <button
                  onClick={() => copyToClipboard(newApiKey)}
                  className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setShowNewKey(false)}
                className="mt-3 text-sm text-green-600 hover:text-green-700"
              >
                닫기
              </button>
            </div>
          )}

          {/* API 키 목록 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-3">내 API 키 목록</h3>
            {apiKeys.length === 0 ? (
              <p className="text-gray-500 text-center py-8">발급된 API 키가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{key.name}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {key.isActive ? '활성' : '비활성'}
                          </span>
                          {key.plan && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {key.plan.name}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-3">
                          <p>생성일: {formatDate(key.createdAt)}</p>
                          {key.lastUsedAt && <p>마지막 사용: {formatDate(key.lastUsedAt)}</p>}
                        </div>

                        {/* 사용량 통계 */}
                        {key.usage && key.plan && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">일간 사용량</span>
                              <span className="font-medium">
                                {key.usage.daily.toLocaleString()} / {key.plan.dailyLimit.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(key.usage.daily, key.plan.dailyLimit))}`}
                                style={{ width: `${getUsagePercentage(key.usage.daily, key.plan.dailyLimit)}%` }}
                              ></div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">월간 사용량</span>
                              <span className="font-medium">
                                {key.usage.monthly.toLocaleString()} / {key.plan.monthlyLimit.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(key.usage.monthly, key.plan.monthlyLimit))}`}
                                style={{ width: `${getUsagePercentage(key.usage.monthly, key.plan.monthlyLimit)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => revokeApiKey(key.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="API 키 폐기"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 에러 및 성공 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
      </div>
    </div>
  );
} 