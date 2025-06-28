const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3004;

app.use(cors());
app.use(express.json());

// 기본 상태 확인
app.get('/', (req, res) => {
  res.json({ message: '제주 SNS API 서버가 실행 중입니다.' });
});

// 테스트 로그인
app.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 데이터베이스에서 사용자 확인
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    
    if (user && user.password === password) {
      res.json({
        message: '로그인이 완료되었습니다.',
        token: 'test-token-12345',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      });
    } else {
      res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 테스트 회원가입
app.post('/test-signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // 실제로 사용자를 데이터베이스에 생성
    const user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: password, // 실제로는 해시화해야 함
      },
    });
    
    res.json({
      message: '회원가입이 완료되었습니다.',
      token: 'test-token-12345',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 게시글 목록 조회
app.get('/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      posts,
      total: posts.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 게시글 생성 (테스트용)
app.post('/posts', async (req, res) => {
  try {
    const { title, content, location } = req.body;
    
    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
        location: location || '제주시',
        userId: 1, // 테스트 사용자 ID
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        photos: true,
      },
    });

    res.json({
      message: '게시글이 성공적으로 작성되었습니다.',
      post,
    });
  } catch (error) {
    res.status(500).json({ 
      error: '게시글 작성에 실패했습니다.',
      details: error.message 
    });
  }
});

// 댓글 작성 (테스트용)
app.post('/comments/test', async (req, res) => {
  try {
    const { content, postId } = req.body;
    
    const comment = await prisma.comment.create({
      data: {
        content: content,
        userId: 1, // 테스트 사용자 ID
        postId: postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json({
      message: '댓글이 성공적으로 작성되었습니다.',
      comment,
    });
  } catch (error) {
    res.status(500).json({ 
      error: '댓글 작성에 실패했습니다.',
      details: error.message 
    });
  }
});

// 게시글별 댓글 조회
app.get('/comments/post/:postId', async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        parentId: null, // 최상위 댓글만
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      comments,
      total: comments.length,
    });
  } catch (error) {
    res.status(500).json({ 
      error: '댓글 조회에 실패했습니다.',
      details: error.message 
    });
  }
});

// 게시글 좋아요
app.post('/posts/:id/like', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = 1; // 테스트 사용자 ID

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      // 좋아요 취소
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: userId,
            postId: postId,
          },
        },
      });

      res.json({ message: '게시글 좋아요가 취소되었습니다.', liked: false });
    } else {
      // 좋아요 추가
      await prisma.like.create({
        data: {
          userId: userId,
          postId: postId,
        },
      });

      res.json({ message: '게시글에 좋아요를 눌렀습니다.', liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 키 목록 조회 (테스트용)
app.get('/api-keys', async (req, res) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: 1, // 테스트 사용자 ID
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    res.json({ apiKeys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 알림 목록 조회 (테스트용)
app.get('/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: 1, // 테스트 사용자 ID
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`테스트 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`API 문서: http://localhost:${PORT}`);
}); 