'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    profileImage?: string;
  };
  replies: Comment[];
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
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { user, token } = useAuth();

  // 댓글 목록 조회
  const fetchComments = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3004/comments/${postId}?page=${pageNum}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setTotalPages(Math.ceil((data.total || 0) / 10));
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
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
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
    }
  };

  // 대댓글 작성
  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim() || !token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3004/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyContent,
          postId,
          parentId,
        }),
      });

      if (response.ok) {
        const reply = await response.json();
        setComments(prev => 
          prev.map(comment => 
            comment.id === parentId 
              ? { ...comment, replies: [...comment.replies, reply] }
              : comment
          )
        );
        setReplyContent('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('대댓글 작성 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 수정
  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim() || !token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3004/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: commentId,
          content: editContent,
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, content: updatedComment.content }
              : comment
          )
        );
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('댓글 수정 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!token || !confirm('댓글을 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3004/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 좋아요
  const handleLikeComment = async (commentId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3004/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('댓글 좋아요 오류:', error);
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

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`border-l-2 border-gray-200 pl-4 ${isReply ? 'ml-8' : ''}`}>
      <div className="flex items-start space-x-3 mb-2">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
          {comment.user.profileImage ? (
            <img src={comment.user.profileImage} alt={comment.user.username} className="w-full h-full rounded-full" />
          ) : (
            comment.user.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">{comment.user.username}</span>
            <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
          </div>
          
          {editingComment === comment.id ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={2}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
          )}

          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => handleLikeComment(comment.id)}
              className="text-xs text-gray-500 hover:text-blue-500"
            >
              좋아요 {comment._count.likes}
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="text-xs text-gray-500 hover:text-blue-500"
              >
                답글 {comment._count.replies}
              </button>
            )}
            {user && (user.id === comment.user.id) && (
              <>
                <button
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="text-xs text-gray-500 hover:text-blue-500"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              </>
            )}
          </div>

          {/* 대댓글 작성 폼 */}
          {replyTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="대댓글을 입력하세요..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={2}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  답글 작성
                </button>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 대댓글 목록 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">댓글 ({comments.length})</h3>
      
      {/* 댓글 작성 폼 */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.username} className="w-full h-full rounded-full" />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? '작성 중...' : '댓글 작성'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* 더보기 버튼 */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchComments(nextPage);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            더 많은 댓글 보기
          </button>
        </div>
      )}

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
        </div>
      )}
    </div>
  );
} 