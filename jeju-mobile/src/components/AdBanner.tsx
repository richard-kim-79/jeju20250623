import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface AdBannerProps {
  position?: 'top' | 'bottom';
  style?: any;
}

const { width } = Dimensions.get('window');

export default function AdBanner({ position = 'top', style }: AdBannerProps) {
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  // 광고 목록 조회
  const fetchAds = async () => {
    try {
      const response = await fetch(`http://localhost:3000/ads?position=${position}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setCurrentAd(data[0]);
        }
      } else {
        // API 실패 시 mock 데이터 사용
        const mockAd: Ad = {
          id: 1,
          title: "제주 특가 호텔",
          description: "제주도 최고의 호텔들을 특별한 가격으로 만나보세요!",
          imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
          linkUrl: "#",
          position: position,
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setCurrentAd(mockAd);
      }
    } catch (error) {
      console.error('광고 로드 실패:', error);
      // 에러 시에도 mock 데이터 사용
      const mockAd: Ad = {
        id: 1,
        title: "제주 특가 호텔",
        description: "제주도 최고의 호텔들을 특별한 가격으로 만나보세요!",
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
        linkUrl: "#",
        position: position,
        isActive: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      setCurrentAd(mockAd);
    } finally {
      setLoading(false);
    }
  };

  // 광고 노출 기록
  const recordImpression = async (adId: number) => {
    try {
      await fetch(`http://localhost:3000/ads/${adId}/impression`, {
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
      await fetch(`http://localhost:3000/ads/${adId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: null, // 모바일에서는 사용자 ID를 별도로 관리해야 함
        }),
      });
    } catch (error) {
      console.error('광고 클릭 기록 실패:', error);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [position]);

  // 광고가 로드될 때마다 노출 기록
  useEffect(() => {
    if (currentAd) {
      recordImpression(currentAd.id);
    }
  }, [currentAd]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    if (currentAd) {
      // 광고 클릭 기록
      recordClick(currentAd.id);
      
      // 링크 열기 (실제 앱에서는 웹뷰나 외부 브라우저로 열어야 함)
      Alert.alert('광고 링크', `${currentAd.title}\n\n링크: ${currentAd.linkUrl}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <Text style={styles.loadingText}>광고 로딩 중...</Text>
      </View>
    );
  }

  if (!isVisible || !currentAd) {
    return null;
  }

  const getBannerStyle = () => {
    switch (position) {
      case 'top':
        return styles.topBanner;
      case 'bottom':
        return styles.bottomBanner;
      default:
        return styles.topBanner;
    }
  };

  return (
    <View style={[styles.container, getBannerStyle(), style]}>
      {/* 닫기 버튼 */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
      >
        <Ionicons name="close" size={16} color="#fff" />
      </TouchableOpacity>

      {/* 광고 내용 */}
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={handleClick}
        activeOpacity={0.8}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentAd.title}</Text>
          {currentAd.description && (
            <Text style={styles.description} numberOfLines={2}>
              {currentAd.description}
            </Text>
          )}
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>자세히 보기</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </View>
        
        {currentAd.imageUrl && (
          <Image
            source={{ uri: currentAd.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {/* 광고 표시 표시 */}
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>광고</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  topBanner: {
    backgroundColor: '#3B82F6',
  },
  bottomBanner: {
    backgroundColor: '#10B981',
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  adLabel: {
    position: 'absolute',
    bottom: 8,
    left: 16,
  },
  adLabelText: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.7,
  },
}); 