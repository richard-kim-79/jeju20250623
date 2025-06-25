'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Heart, MessageCircle, Share2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Comments from '../../components/Comments';

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

export default function PostDetail() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('사용자 정보 파싱 오류:', e);
      }
    }

    // 게시글 상세 정보 조회
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:3000/posts/${postId}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
        } else {
          // API가 없을 경우 mock 데이터 사용
          const mockPost: Post = {
            id: parseInt(postId),
            title: "제주 올레길 추천 코스",
            content: "제주 올레 7코스는 정말 아름다운 해안 경관을 볼 수 있어요. 특히 일출봉 근처의 바다 전망이 환상적입니다. 가족과 함께 걷기 좋은 코스입니다. 이 코스는 총 15km로 약 4-5시간 정도 소요되며, 중간중간 쉬어갈 수 있는 휴게소도 잘 갖춰져 있습니다. 봄에는 유채꽃, 여름에는 푸른 바다, 가을에는 단풍, 겨울에는 설경을 볼 수 있어 사계절 내내 아름다운 풍경을 즐길 수 있습니다.",
            user: {
              id: 1,
              email: "user1@example.com",
              username: "제주러버"
            },
            createdAt: "2024-06-23T10:00:00Z",
            location: "제주 올레 7코스",
            photos: [
              { id: 1, url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop" },
              { id: 2, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop" }
            ],
            _count: {
              likes: 24,
              comments: 8
            }
          };
          setPost(mockPost);
        }
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setLiked(!liked);
        if (post) {
          setPost({
            ...post,
            _count: {
              ...post._count,
              likes: liked ? (post._count?.likes || 1) - 1 : (post._count?.likes || 0) + 1,
              comments: post._count?.comments || 0
            }
          });
        }
      }
    } catch (err) {
      setError('좋아요 처리에 실패했습니다.');
    }
  };

  const handleEdit = () => {
    router.push(`/write?edit=${postId}`);
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/');
      } else {
        setError('게시글 삭제에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h2>
        <p className="text-gray-600 mb-4">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const canEdit = currentUser && currentUser.id === post.user.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        뒤로가기
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 게시글 상세 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* 이미지 */}
        {post.photos && post.photos.length > 0 && (
          <div className="relative h-96">
            <img
              src={post.photos[0].url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 게시글 내용 */}
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {post.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{post.user.username}</h3>
                <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            
            {canEdit && (
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* 위치 */}
          {post.location && (
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{post.location}</span>
            </div>
          )}

          {/* 내용 */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  liked 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{post._count?.likes || 0}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{post._count?.comments || 0}</span>
              </button>
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
              <span>공유</span>
            </button>
          </div>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Comments postId={parseInt(postId)} />
      </div>
    </div>
  );
} 