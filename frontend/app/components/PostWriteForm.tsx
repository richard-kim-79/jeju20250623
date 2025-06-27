import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function PostWriteForm({ onSubmit }: { onSubmit: (post: any) => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError('제목과 내용을 입력해 주세요.');
      return;
    }
    setError('');
    onSubmit({
      id: Date.now(),
      user: { username: user.username, profileImage: '', },
      createdAt: '방금 전',
      title,
      content,
      image,
      likeCount: 0,
      commentCount: 0
    });
    setTitle(''); setContent(''); setImage('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#181818] shadow-2xl rounded-2xl p-6 w-full max-w-xl mx-auto mb-8 text-white">
      <h3 className="text-lg font-bold mb-4">글쓰기</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" className="w-full mb-3 px-4 py-2 rounded bg-black border border-gray-700 focus:ring-2 focus:ring-[#1d9bf0] outline-none" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용" className="w-full mb-3 px-4 py-2 rounded bg-black border border-gray-700 focus:ring-2 focus:ring-[#1d9bf0] outline-none min-h-[80px]" />
      <input value={image} onChange={e => setImage(e.target.value)} placeholder="이미지 URL (선택)" className="w-full mb-3 px-4 py-2 rounded bg-black border border-gray-700 focus:ring-2 focus:ring-[#1d9bf0] outline-none" />
      {error && <div className="text-red-400 mb-3 text-sm text-center">{error}</div>}
      <button type="submit" className="w-full bg-[#1d9bf0] hover:bg-[#007AFF] text-white font-semibold py-2 rounded transition-colors mt-2">작성</button>
    </form>
  );
} 