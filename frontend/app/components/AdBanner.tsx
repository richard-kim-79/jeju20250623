'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdBannerProps {
  position?: 'top' | 'bottom' | 'sidebar';
  className?: string;
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
}

export default function AdBanner({ position = 'top', className = '' }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 광고 목록 조회
  const fetchAds = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      const response = await fetch(`${apiUrl}/ads?position=${position}`);
      if (response.ok) {
        const data = await response.json();
        setAds(data);
        if (data.length > 0) {
          setCurrentAd(data[0]);
          // 광고 노출 기록
          recordImpression(data[0].id);
        }
      } else {
        // API 실패 시 mock 데이터 사용
        const mockAds: Ad[] = [
          {
            id: 1,
            title: "제주 특가 호텔",
            description: "제주도 최고의 호텔들을 특별한 가격으로 만나보세요!",
            imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
            linkUrl: "#",
            position: position,
            isActive: true,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            title: "제주 렌터카 할인",
            description: "제주 여행 필수! 렌터카 20% 할인 혜택을 놓치지 마세요.",
            imageUrl: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=200&fit=crop",
            linkUrl: "#",
            position: position,
            isActive: true,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ];
        setAds(mockAds);
        setCurrentAd(mockAds[0]);
      }
    } catch (error) {
      console.error('광고 로드 실패:', error);
      // 에러 시에도 mock 데이터 사용
      const mockAds: Ad[] = [
        {
          id: 1,
          title: "제주 특가 호텔",
          description: "제주도 최고의 호텔들을 특별한 가격으로 만나보세요!",
          imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
          linkUrl: "#",
          position: position,
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      setAds(mockAds);
      setCurrentAd(mockAds[0]);
    } finally {
      setLoading(false);
    }
  };

  // 광고 노출 기록
  const recordImpression = async (adId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      await fetch(`${apiUrl}/ads/${adId}/impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('광고 노출 기록 실패:', error);
    }
  };

  // 광고 클릭 기록
  const recordClick = async (adId: number) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      await fetch(`${apiUrl}/ads/${adId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });
    } catch (error) {
      console.error('광고 클릭 기록 실패:', error);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [position]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setCurrentAd(ads[(currentIndex + 1) % ads.length]);
      }, 5000); // 5초마다 광고 변경

      return () => clearInterval(interval);
    }
  }, [currentIndex, ads.length]);

  // 광고가 변경될 때마다 노출 기록
  useEffect(() => {
    if (currentAd) {
      recordImpression(currentAd.id);
    }
  }, [currentAd]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClick = async () => {
    if (currentAd) {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        // 광고 클릭 기록
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
        await fetch(`${apiUrl}/ads/${currentAd.id}/click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id || 'anonymous',
          }),
        });

        // 광고 링크로 이동
        window.open(currentAd.linkUrl, '_blank');
      } catch (error) {
        console.error('광고 클릭 기록 오류:', error);
        // 오류가 발생해도 광고 링크는 열기
        window.open(currentAd.linkUrl, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isVisible || !currentAd || ads.length === 0) {
    return null;
  }

  const getBannerStyles = () => {
    switch (position) {
      case 'top':
        return 'w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white';
      case 'bottom':
        return 'w-full bg-gradient-to-r from-green-500 to-blue-600 text-white';
      case 'sidebar':
        return 'w-64 bg-gradient-to-r from-orange-500 to-red-600 text-white';
      default:
        return 'w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white';
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg ${getBannerStyles()} ${className}`}>
      {/* 닫기 버튼 */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 z-10 text-white hover:text-gray-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 광고 내용 */}
      <div className="flex items-center p-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{currentAd.title}</h3>
          {currentAd.description && (
            <p className="text-sm opacity-90 mb-3">{currentAd.description}</p>
          )}
          <button
            onClick={handleClick}
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            자세히 보기
          </button>
        </div>
        {currentAd.imageUrl && (
          <div className="ml-4">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* 광고 표시 표시 */}
      <div className="absolute bottom-2 left-4 text-xs opacity-75">
        광고
      </div>

      {/* 광고 인디케이터 */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 right-4 flex space-x-1">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 