const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3004;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081'],
  credentials: true,
}));

// JSON 파싱
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '제주 SNS API 서버가 실행 중입니다.' });
});

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: '서버가 정상적으로 실행 중입니다.'
  });
});

// 테스트 라우트
app.get('/test', (req, res) => {
  res.json({ 
    message: '테스트 성공!', 
    timestamp: new Date().toISOString() 
  });
});

// 테스트용 로그인
app.post('/auth/test-login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@test.com' && password === '123456') {
    res.json({
      message: '로그인이 완료되었습니다.',
      token: 'test-token-12345',
      user: {
        id: 1,
        email: 'test@test.com',
        username: '테스트사용자'
      }
    });
  } else {
    res.status(401).json({
      message: '이메일 또는 비밀번호가 올바르지 않습니다.'
    });
  }
});

// 테스트용 회원가입
app.post('/auth/test-signup', (req, res) => {
  const { email, password, username } = req.body;
  
  if (email && password && username) {
    res.json({
      message: '회원가입이 완료되었습니다.',
      token: 'test-token-12345',
      user: {
        id: 1,
        email: email,
        username: username
      }
    });
  } else {
    res.status(400).json({
      message: '모든 필드를 입력해주세요.'
    });
  }
});

// 테스트용 게시글 목록
app.get('/posts', (req, res) => {
  res.json({
    posts: [
      {
        id: 1,
        title: '제주도 맛집 추천',
        content: '제주도에서 꼭 가봐야 할 맛집들을 소개합니다.',
        location: '제주시',
        user: {
          id: 1,
          email: 'test@test.com',
          username: '테스트사용자'
        },
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: '한라산 등산 후기',
        content: '한라산 등산 경험을 공유합니다.',
        location: '서귀포시',
        user: {
          id: 1,
          email: 'test@test.com',
          username: '테스트사용자'
        },
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1
  });
});

// 광고 API
app.get('/ads', (req, res) => {
  const { position } = req.query;
  
  const ads = [
    {
      id: 1,
      title: "제주 특가 호텔",
      description: "제주도 최고의 호텔들을 특별한 가격으로 만나보세요!",
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop",
      linkUrl: "https://example.com/hotel",
      position: position || "top",
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: "제주 렌터카 할인",
      description: "제주 여행 필수! 렌터카 20% 할인 혜택을 놓치지 마세요.",
      imageUrl: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=200&fit=crop",
      linkUrl: "https://example.com/car",
      position: position || "bottom",
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];
  
  res.json(ads);
});

// 광고 노출 기록
app.post('/ads/:id/impression', (req, res) => {
  const { id } = req.params;
  console.log(`광고 노출 기록: 광고 ID ${id}`);
  res.json({ message: '노출이 기록되었습니다.' });
});

// 광고 클릭 기록
app.post('/ads/:id/click', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  console.log(`광고 클릭 기록: 광고 ID ${id}, 사용자 ID ${userId || 'anonymous'}`);
  res.json({ message: '클릭이 기록되었습니다.' });
});

// 광고 통계 조회
app.get('/ads/stats/all', (req, res) => {
  const stats = [
    {
      adId: 1,
      title: "제주 특가 호텔",
      impressions: 1250,
      clicks: 45
    },
    {
      adId: 2,
      title: "제주 렌터카 할인",
      impressions: 980,
      clicks: 32
    }
  ];
  
  res.json(stats);
});

// API 키 플랜 조회
app.get('/api-keys/plans', (req, res) => {
  const plans = [
    {
      id: 1,
      name: "무료",
      description: "일일 1,000회, 월 10,000회 API 호출",
      monthlyLimit: 10000,
      dailyLimit: 1000,
      rateLimit: 10,
      price: 0,
      features: ["기본 API 호출", "문서 접근"]
    },
    {
      id: 2,
      name: "프로",
      description: "일일 10,000회, 월 100,000회 API 호출",
      monthlyLimit: 100000,
      dailyLimit: 10000,
      rateLimit: 100,
      price: 50000,
      features: ["고급 API 호출", "우선 지원", "실시간 통계"]
    }
  ];
  
  res.json(plans);
});

// 댓글 목록 조회
app.get('/comments/:postId', (req, res) => {
  const { postId } = req.params;
  
  const comments = [
    {
      id: 1,
      content: '정말 맛있는 곳이네요! 다음에 가보고 싶습니다.',
      postId: parseInt(postId),
      user: {
        id: 1,
        email: 'test@test.com',
        username: '테스트사용자'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      content: '저도 추천합니다! 특히 해산물이 맛있어요.',
      postId: parseInt(postId),
      user: {
        id: 2,
        email: 'user2@test.com',
        username: '사용자2'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  res.json({
    comments,
    total: comments.length
  });
});

// 댓글 작성
app.post('/comments', (req, res) => {
  const { content, postId } = req.body;
  
  if (!content || !postId) {
    return res.status(400).json({
      message: '내용과 게시글 ID를 입력해주세요.'
    });
  }
  
  const newComment = {
    id: Math.floor(Math.random() * 1000) + 1,
    content,
    postId: parseInt(postId),
    user: {
      id: 1,
      email: 'test@test.com',
      username: '테스트사용자'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.status(201).json({
    message: '댓글이 작성되었습니다.',
    comment: newComment
  });
});

// 댓글 삭제
app.delete('/comments/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    message: `댓글 ID ${id}가 삭제되었습니다.`
  });
});

// 좋아요 토글
app.post('/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  console.log(`게시글 ${id} 좋아요 토글: 사용자 ${userId}`);
  
  res.json({
    message: '좋아요가 처리되었습니다.',
    postId: parseInt(id),
    userId: userId,
    liked: true,
    likeCount: 15
  });
});

// 좋아요 상태 확인
app.get('/posts/:id/likes', (req, res) => {
  const { id } = req.params;
  
  res.json({
    postId: parseInt(id),
    likeCount: 15,
    likedBy: [1, 2, 3]
  });
});

// 실시간 알림 목록
app.get('/notifications', (req, res) => {
  const notifications = [
    {
      id: 1,
      type: 'like',
      message: '테스트사용자가 회원님의 게시글을 좋아합니다.',
      postId: 1,
      userId: 1,
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      type: 'comment',
      message: '사용자2가 회원님의 게시글에 댓글을 남겼습니다.',
      postId: 1,
      userId: 2,
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json({
    notifications,
    unreadCount: 2
  });
});

// 알림 읽음 처리
app.put('/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  
  res.json({
    message: `알림 ${id}가 읽음 처리되었습니다.`,
    notificationId: parseInt(id)
  });
});

// WebSocket 연결 테스트용 엔드포인트
app.get('/socket-test', (req, res) => {
  res.json({
    message: 'WebSocket 연결 테스트',
    socketUrl: `ws://localhost:${PORT}`,
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`테스트 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`서버 URL: http://localhost:${PORT}`);
  console.log(`헬스 체크: http://localhost:${PORT}/health`);
  console.log(`테스트: http://localhost:${PORT}/test`);
  console.log(`광고 API: http://localhost:${PORT}/ads`);
}); 