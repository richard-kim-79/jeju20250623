'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Eye, MousePointer, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface AdStats {
  adId: number;
  title: string;
  impressions: number;
  clicks: number;
}

interface Ad {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  maxClicks?: number;
  maxImpressions?: number;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // 광고 목록 조회
  const fetchAds = async () => {
    try {
      const response = await fetch('http://localhost:3000/ads');
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error('광고 목록 조회 실패:', error);
    }
  };

  // 광고 통계 조회
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/ads/stats/all');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('광고 통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const getTotalStats = () => {
    const totalImpressions = stats.reduce((sum, stat) => sum + stat.impressions, 0);
    const totalClicks = stats.reduce((sum, stat) => sum + stat.clicks, 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';
    
    return { totalImpressions, totalClicks, avgCTR };
  };

  const totalStats = getTotalStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">광고 관리</h1>
        <p className="text-gray-600">광고 통계 및 관리</p>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 노출수</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalImpressions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MousePointer className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 클릭수</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 CTR</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.avgCTR}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 광고</p>
              <p className="text-2xl font-bold text-gray-900">{ads.filter(ad => ad.isActive).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 광고 목록 및 통계 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">광고 목록</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              새 광고 등록
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  광고 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  위치
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  노출수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  클릭수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  기간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads.map((ad) => {
                const adStats = stats.find(stat => stat.adId === ad.id);
                const impressions = adStats?.impressions || 0;
                const clicks = adStats?.clicks || 0;
                const ctr = calculateCTR(impressions, clicks);

                return (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ad.imageUrl && (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          {ad.description && (
                            <div className="text-sm text-gray-500">{ad.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {ad.position}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ctr}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ad.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ad.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(ad.startDate)}</div>
                      <div>~ {formatDate(ad.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedAd(ad)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        상세보기
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        수정
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 광고 상세 모달 */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedAd.title}</h3>
              <button
                onClick={() => setSelectedAd(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedAd.imageUrl && (
                <img
                  src={selectedAd.imageUrl}
                  alt={selectedAd.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h4 className="font-medium text-gray-900">설명</h4>
                <p className="text-gray-600">{selectedAd.description || '설명 없음'}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">링크</h4>
                <a href={selectedAd.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  {selectedAd.linkUrl}
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">위치</h4>
                  <p className="text-gray-600">{selectedAd.position}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">상태</h4>
                  <p className="text-gray-600">{selectedAd.isActive ? '활성' : '비활성'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">시작일</h4>
                  <p className="text-gray-600">{formatDate(selectedAd.startDate)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">종료일</h4>
                  <p className="text-gray-600">{formatDate(selectedAd.endDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 