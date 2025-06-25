'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, MapPin, X } from 'lucide-react';

export default function WritePage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('이미지는 최대 5개까지 업로드할 수 있습니다.');
      return;
    }
    setImages([...images, ...files]);
    setError('');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.location) {
        formDataToSend.append('location', formData.location);
      }
      
      images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      const response = await fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.message || '게시글 작성에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">새 게시글 작성</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              위치 (선택사항)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="위치를 입력하세요 (예: 제주 올레 7코스)"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="내용을 입력하세요"
              value={formData.content}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 업로드 (최대 5개)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="image-upload" className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                    이미지 선택
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, GIF 파일을 선택하세요
                </p>
              </div>
            </div>
            
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '작성 중...' : '게시글 작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 