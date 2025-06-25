import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Post } from '../types';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AdBanner from '../components/AdBanner';

type RootStackParamList = {
  PostDetail: { post: Post };
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      Alert.alert('오류', '게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: number) => {
    if (!isAuthenticated) {
      Alert.alert('로그인 필요', '좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }

    try {
      await postsAPI.likePost(postId);
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.add(postId);
        return newSet;
      });
    } catch (error) {
      console.error('좋아요 실패:', error);
      Alert.alert('오류', '좋아요 처리에 실패했습니다.');
    }
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate('PostDetail', { post });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostPress(item)}
    >
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.user.username}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.location}>{item.location}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content} numberOfLines={3}>
        {item.content}
      </Text>

      {item.photos.length > 0 && (
        <Image
          source={{ uri: item.photos[0].url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons
            name={likedPosts.has(item.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={likedPosts.has(item.id) ? '#ff4757' : '#666'}
          />
          <Text style={styles.actionText}>
            {likedPosts.has(item.id) ? '1' : '0'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>제주</Text>
        <Text style={styles.headerSubtitle}>지역 정보 공유 SNS</Text>
      </View>
      
      {/* 상단 광고 배너 */}
      <View style={styles.adContainer}>
        <AdBanner position="top" />
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.adContainer}>
      <AdBanner position="bottom" />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  adContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
}); 