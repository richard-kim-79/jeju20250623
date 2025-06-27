'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Heart, MessageCircle, Share2, Plus, Search, MoreHorizontal } from 'lucide-react';
import AdBanner from './components/AdBanner';
import PostCard from './components/PostCard';
import { useAuth } from './contexts/AuthContext';
import PostWriteForm from './components/PostWriteForm';

interface Post {
  id: number;
  user: {
    username: string;
    profileImage: string;
  };
  createdAt: string;
  content: string;
  image?: string;
  likeCount: number;
  commentCount: number;
}

const mockPosts = [
  {
    id: 1,
    user: {
      username: '제주러버',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'
    },
    createdAt: '방금 전',
    content: '제주 올레길 추천 코스! 오늘은 날씨도 좋아서 더욱 특별했어요 🌊☀️',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    likeCount: 24,
    commentCount: 8
  },
  // ...더 많은 mock 데이터
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
        const response = await fetch(`${apiUrl}/posts`);
        
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        } else {
          // API 실패 시 mock 데이터 사용
          const mockPosts: Post[] = [
            {
              id: 1,
              user: { 
                username: "제주여행러",
                profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
              },
              createdAt: "2024-06-23T10:00:00Z",
              content: "오늘 한라산 등반 완료! 정상에서 바라본 제주 전경이 정말 아름다워요. 등산로가 잘 정비되어 있어서 초보자도 쉽게 올라갈 수 있었습니다. 🏔️✨",
              image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
              likeCount: 89,
              commentCount: 8
            },
            {
              id: 2,
              user: { 
                username: "맛집탐험가",
                profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
              },
              createdAt: "2024-06-22T15:30:00Z",
              content: "성산일출봉 근처에 있는 해산물 맛집을 발견했습니다. 신선한 전복회와 해산물 파스타가 정말 맛있어요. 특히 전복회는 입에서 살살 녹아요! 🍽️✨",
              image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
              likeCount: 156,
              commentCount: 23
            },
            {
              id: 3,
              user: { 
                username: "제주날씨맨",
                profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
              },
              createdAt: "2024-06-23T08:00:00Z",
              content: "오늘 제주 날씨가 정말 좋네요. 바람이 약간 있지만 산책하기 딱 좋은 날씨입니다. 오후에는 구름이 조금 끼겠지만 전반적으로 맑은 하늘을 기대할 수 있어요! ☁️🌤️",
              likeCount: 12,
              commentCount: 3
            }
          ];
          setPosts(mockPosts);
        }
      } catch (error) {
        console.error('게시글 로딩 오류:', error);
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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
      const response = await fetch(`${apiUrl}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likeCount: post.likeCount + 1 }
              : post
          )
        );
      } else {
        alert('좋아요 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('좋아요 오류:', error);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  };

  const handleAddPost = (post: any) => {
    setPosts([post, ...posts]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 상단 네비게이션 */}
      <nav className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold text-xl tracking-tight cursor-pointer" onClick={() => router.push('/')}>제주</span>
        </div>
        <div className="flex items-center space-x-3">
          <button aria-label="검색" className="p-2 rounded-full hover:bg-gray-800 focus:ring-2 focus:ring-[#1d9bf0] transition-colors">
            <Search className="w-5 h-5 text-gray-300" />
          </button>
          {/* 데스크탑용 글쓰기 버튼 */}
          <button className="bg-[#1d9bf0] text-white px-4 py-2 rounded-full font-medium hover:bg-[#007AFF] transition-colors flex items-center sm:flex hidden">
            <Plus className="w-5 h-5 mr-1" />
            글쓰기
          </button>
          {/* 모바일용 글쓰기 아이콘 */}
          <button aria-label="글쓰기" className="bg-[#1d9bf0] text-white p-2 rounded-full hover:bg-[#007AFF] focus:ring-2 focus:ring-[#1d9bf0] transition-colors flex sm:hidden">
            <Plus className="w-5 h-5" />
          </button>
          {/* 로그인 상태에 따라 버튼 전환 */}
          {user ? (
            <>
              <button onClick={() => router.push('/profile')} className="ml-2 px-4 py-2 rounded-full bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors hidden sm:block">마이페이지</button>
              <button onClick={logout} className="ml-2 px-4 py-2 rounded-full bg-[#1d9bf0] text-white text-sm font-medium hover:bg-[#007AFF] transition-colors hidden sm:block">로그아웃</button>
              {/* 모바일용 */}
              <button onClick={() => router.push('/profile')} aria-label="마이페이지" className="ml-1 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors sm:hidden flex items-center justify-center">
                <span className="text-xs">마이</span>
              </button>
              <button onClick={logout} aria-label="로그아웃" className="ml-1 p-2 rounded-full bg-[#1d9bf0] text-white hover:bg-[#007AFF] transition-colors sm:hidden flex items-center justify-center">
                <span className="text-xs">로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')} className="ml-2 px-4 py-2 rounded-full bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors hidden sm:block">로그인</button>
              <button onClick={() => router.push('/signup')} className="ml-2 px-4 py-2 rounded-full bg-[#1d9bf0] text-white text-sm font-medium hover:bg-[#007AFF] transition-colors hidden sm:block">회원가입</button>
              {/* 모바일용 */}
              <button onClick={() => router.push('/login')} aria-label="로그인" className="ml-1 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors sm:hidden flex items-center justify-center">
                <span className="text-xs">로그인</span>
              </button>
              <button onClick={() => router.push('/signup')} aria-label="회원가입" className="ml-1 p-2 rounded-full bg-[#1d9bf0] text-white hover:bg-[#007AFF] transition-colors sm:hidden flex items-center justify-center">
                <span className="text-xs">가입</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 글쓰기 폼 */}
      <PostWriteForm onSubmit={handleAddPost} />

      {/* 메인 콘텐츠 */}
      <main className="max-w-2xl mx-auto w-full">
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mx-4 my-4">
            {error}
          </div>
        )}
        {posts.length === 0 && (
          <div className="text-center text-gray-400 py-16">게시글이 없습니다.</div>
        )}
        <div className="flex flex-col items-center">
          {/* 모바일 안내 메시지 */}
          <div className="sm:hidden block text-center text-gray-500 py-16">
            데스크탑에서 더 많은 콘텐츠를 확인하세요.
          </div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>

      {/* 하단 광고 배너 */}
      <div className="max-w-2xl mx-auto my-8 px-4">
        <AdBanner position="bottom" className="rounded-xl" />
      </div>
    </div>
  );
}
