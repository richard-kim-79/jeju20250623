'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Heart, MessageCircle, Share2, Plus, Search } from 'lucide-react';
import AdBanner from './components/AdBanner';

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
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:3004/posts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || data);
        } else {
          const mockPosts: Post[] = [
            {
              id: 1,
              title: "제주 올레길 추천 코스",
              content: "제주 올레 7코스는 정말 아름다운 해안 경관을 볼 수 있어요. 특히 일출봉 근처의 바다 전망이 환상적입니다.",
              user: { id: 1, email: "user1@example.com", username: "제주러버" },
              createdAt: "2024-06-23T10:00:00Z",
              location: "제주 올레 7코스",
              photos: [{ id: 1, url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop" }]
            },
            {
              id: 2,
              title: "제주 맛집 발견!",
              content: "성산일출봉 근처에 있는 해산물 맛집을 발견했습니다. 신선한 전복회와 해산물 파스타가 정말 맛있어요.",
              user: { id: 2, email: "user2@example.com", username: "맛집탐험가" },
              createdAt: "2024-06-22T15:30:00Z",
              location: "성산일출봉",
              photos: [{ id: 2, url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop" }]
            },
            {
              id: 3,
              title: "제주 날씨 정보",
              content: "오늘 제주 날씨가 정말 좋네요. 바람이 약간 있지만 산책하기 딱 좋은 날씨입니다.",
              user: { id: 3, email: "user3@example.com", username: "제주날씨맨" },
              createdAt: "2024-06-23T08:00:00Z",
              location: "제주시",
              photos: []
            }
          ];
          setPosts(mockPosts);
        }
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push('/write');
    }
  };

  const handleLike = async (postId: number) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3004/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
      } else {
        setError('좋아요 처리에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-primary-600 font-bold text-xl tracking-tight cursor-pointer" onClick={() => router.push('/')}>제주</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => router.push('/search')} className="p-2 rounded hover:bg-gray-100">
            <Search className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={handleWriteClick} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-1" /> 글쓰기
          </button>
        </div>
      </nav>

      {/* 상단 광고 배너 */}
      <div className="max-w-2xl mx-auto mt-6 mb-4 px-2">
        <AdBanner position="top" className="rounded-xl" />
      </div>

      {/* 게시글 목록 */}
      <main className="max-w-2xl mx-auto w-full px-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}
        {posts.length === 0 && (
          <div className="text-center text-gray-400 py-16">게시글이 없습니다.</div>
        )}
        <div className="grid gap-6">
          {posts.map((post, index) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 flex flex-col sm:flex-row gap-4">
              {post.photos.length > 0 && (
                <img src={post.photos[0].url} alt={post.title} className="w-full sm:w-40 h-32 object-cover rounded-xl" />
              )}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate cursor-pointer hover:text-primary-600" onClick={() => router.push(`/post/${post.id}`)}>{post.title}</h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1 mb-2 space-x-2">
                    <span>{post.user.username}</span>
                    <span>·</span>
                    <span>{formatDate(post.createdAt)}</span>
                    {post.location && (
                      <span className="flex items-center"><MapPin className="w-3 h-3 mr-0.5" />{post.location}</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 cursor-pointer hover:text-gray-800" onClick={() => router.push(`/post/${post.id}`)}>{post.content}</p>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <button onClick={() => handleLike(post.id)} className={`flex items-center space-x-1 transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                    <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                    <span>{likedPosts.has(post.id) ? '1' : '0'}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-500">
                    <MessageCircle className="w-4 h-4" />
                    <span>0</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-400 hover:text-green-500">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* 하단 광고 배너 */}
      <div className="max-w-2xl mx-auto my-8 px-2">
        <AdBanner position="bottom" className="rounded-xl" />
      </div>
    </div>
  );
}
