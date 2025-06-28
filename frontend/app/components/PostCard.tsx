import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import Comments from './Comments';

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

export default function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false);
  return (
    <article
      className="
        w-[420px] max-w-full
        bg-[#181818]
        shadow-2xl
        rounded-2xl
        p-6
        mb-6
        text-white
        transition
        duration-200
        hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]
        sm:block hidden
      "
    >
      <div className="flex items-center mb-3">
        <img src={post.user.profileImage} className="w-10 h-10 rounded-full mr-3" />
        <span className="font-semibold">{post.user.username}</span>
        <span className="ml-auto text-xs text-[#1d9bf0]">{post.createdAt}</span>
      </div>
      <div className="mb-3 text-base">{post.content}</div>
      {post.image && (
        <img src={post.image} className="rounded-xl w-full object-cover mb-3" />
      )}
      <div className="flex items-center space-x-6 mt-2">
        <button className="flex items-center text-[#1d9bf0] hover:text-blue-400">
          <Heart className="w-5 h-5" />
          <span className="ml-1">{post.likeCount}</span>
        </button>
        <button className="flex items-center text-gray-400 hover:text-blue-400" onClick={() => setShowComments(v => !v)}>
          <MessageCircle className="w-5 h-5" />
          <span className="ml-1">{post.commentCount}</span>
        </button>
        <button className="flex items-center text-gray-400 hover:text-blue-400">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      {showComments && <Comments postId={post.id} />}
    </article>
  );
} 