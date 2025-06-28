import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    profileImage?: string;
  };
  _count: {
    likes: number;
    replies: number;
  };
}

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, token } = useAuth();

  // 댓글 목록 조회
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3004/comments/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('댓글 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:3004/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          postId: postId,
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`http://localhost:3004/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString();
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const canDelete = user && user.id === item.user.id;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.username}>{item.user.username}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          {canDelete && (
            <TouchableOpacity
              onPress={() => handleDeleteComment(item.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={styles.actionText}>{item._count.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.actionText}>{item._count.replies}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>댓글을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>댓글 ({comments.length})</Text>
      
      {/* 댓글 작성 폼 */}
      <View style={styles.commentForm}>
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="댓글을 입력하세요..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.submitButton, (!newComment.trim() || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>작성</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 댓글 목록 */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>아직 댓글이 없습니다</Text>
            <Text style={styles.emptySubtext}>첫 번째 댓글을 작성해보세요!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  commentForm: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
}); 