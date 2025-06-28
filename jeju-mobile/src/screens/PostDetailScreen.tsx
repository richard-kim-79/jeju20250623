import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import Comments from '../components/Comments';

interface Post {
  id: number;
  title: string;
  content: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
  createdAt: string;
  location?: string;
  photos: Array<{ id: number; url: string }>;
  _count?: {
    likes: number;
    comments: number;
  };
}

interface RouteParams {
  postId: number;
}

const { width } = Dimensions.get('window');

export default function PostDetailScreen() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const { postId } = route.params as RouteParams;

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3004/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        Alert.alert('오류', '게시글을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 로딩 오류:', error);
      Alert.alert('오류', '서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!token) {
      Alert.alert('로그인 필요', '좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3004/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPost(prev => prev ? {
          ...prev,
          isLiked: data.liked,
          likeCount: data.likeCount,
        } : null);
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
      Alert.alert('오류', '좋아요 처리에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>게시글을 찾을 수 없습니다</Text>
        <Text style={styles.errorText}>요청하신 게시글이 존재하지 않거나 삭제되었습니다.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 게시글 내용 */}
        <View style={styles.postContainer}>
          {/* 사용자 정보 */}
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {post.user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>{post.user.username}</Text>
              <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>

          {/* 제목 */}
          <Text style={styles.title}>{post.title}</Text>

          {/* 위치 */}
          {post.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.location}>{post.location}</Text>
            </View>
          )}

          {/* 이미지 */}
          {post.photos && post.photos.length > 0 && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: post.photos[0].url }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}

          {/* 내용 */}
          <Text style={styles.contentText}>{post.content}</Text>

          {/* 액션 버튼 */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, liked && styles.actionButtonActive]}
              onPress={handleLike}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? "#ef4444" : "#666"}
              />
              <Text style={[styles.actionText, liked && styles.actionTextActive]}>
                {post._count?.likes || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
              <Text style={styles.actionText}>{post._count?.comments || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="#666" />
              <Text style={styles.actionText}>공유</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <Comments postId={postId} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: width - 64,
    height: 200,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonActive: {
    backgroundColor: '#fef2f2',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  actionTextActive: {
    color: '#ef4444',
  },
  commentsSection: {
    flex: 1,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
}); 