'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Tag, TrendingUp, Clock, Star } from 'lucide-react';

interface SearchResult {
  id: number;
  title: string;
  content: string;
  location?: string;
  category?: string;
  tags?: string[];
  user: {
    id: number;
    username: string;
    email: string;
  };
  createdAt: string;
  score?: number;
  highlights?: {
    title?: string[];
    content?: string[];
    location?: string[];
  };
}

interface SearchFacets {
  categories: Array<{ key: string; doc_count: number }>;
  locations: Array<{ key: string; doc_count: number }>;
  tags: Array<{ key: string; doc_count: number }>;
}

export default function AdvancedSearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity'>('relevance');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<SearchFacets>({ categories: [], locations: [], tags: [] });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'food', label: '맛집' },
    { value: 'travel', label: '관광' },
    { value: 'weather', label: '날씨' },
    { value: 'culture', label: '문화' },
    { value: 'activity', label: '액티비티' },
  ];

  const sortOptions = [
    { value: 'relevance', label: '관련도순', icon: Star },
    { value: 'date', label: '최신순', icon: Clock },
    { value: 'popularity', label: '인기순', icon: TrendingUp },
  ];

  useEffect(() => {
    fetchPopularSearches();
    fetchFacets();
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchPopularSearches = async () => {
    try {
      const response = await fetch('http://localhost:3000/search/popular');
      if (response.ok) {
        const data = await response.json();
        setPopularSearches(data);
      }
    } catch (error) {
      console.error('인기 검색어 로드 실패:', error);
    }
  };

  const fetchFacets = async () => {
    try {
      const response = await fetch('http://localhost:3000/search/facets');
      if (response.ok) {
        const data = await response.json();
        setFacets(data);
      }
    } catch (error) {
      console.error('패싯 정보 로드 실패:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`http://localhost:3000/search/suggestions?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('검색어 제안 로드 실패:', error);
    }
  };

  const performSearch = async (searchPage: number = 1) => {
    if (!query.trim() && category === 'all' && !location && tags.length === 0 && !startDate && !endDate) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (category !== 'all') params.append('category', category);
      if (location) params.append('location', location);
      if (tags.length > 0) params.append('tags', tags.join(','));
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('sortBy', sortBy);
      params.append('page', searchPage.toString());
      params.append('limit', '10');

      const response = await fetch(`http://localhost:3000/search/advanced?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.hits || []);
        setTotalPages(data.totalPages || 0);
        setTotalResults(data.total || 0);
        setPage(searchPage);
      }
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    performSearch(1);
  };

  const handlePopularSearchClick = (popularSearch: string) => {
    setQuery(popularSearch);
    performSearch(1);
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setCategory('all');
    setLocation('');
    setTags([]);
    setStartDate('');
    setEndDate('');
    setSortBy('relevance');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const renderHighlightedText = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) {
      return text;
    }

    const highlightedText = highlights[0];
    return (
      <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">고급 검색</h1>
        <p className="text-gray-600">제주 지역 정보를 다양한 조건으로 검색해보세요</p>
      </div>

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <div className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
            >
              검색
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 필터 사이드바 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">필터</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
              {/* 카테고리 필터 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">카테고리</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.value} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={category === cat.value}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 위치 필터 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  위치
                </h4>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="위치 입력..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* 날짜 범위 필터 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  날짜 범위
                </h4>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* 태그 필터 */}
              {facets.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    태그
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {facets.tags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.key}
                        onClick={() => handleTagToggle(tag.key)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          tags.includes(tag.key)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag.key} ({tag.doc_count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 정렬 옵션 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">정렬</h4>
                <div className="space-y-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="sortBy"
                          value={option.value}
                          checked={sortBy === option.value}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="mr-2"
                        />
                        <Icon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 필터 초기화 */}
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                필터 초기화
              </button>
            </div>
          </div>

          {/* 인기 검색어 */}
          {popularSearches.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 검색어</h3>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularSearchClick(search)}
                    className="block w-full text-left text-sm text-gray-600 hover:text-primary-600 py-1"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 검색 결과 */}
        <div className="lg:col-span-3">
          {/* 검색 결과 헤더 */}
          {totalResults > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  총 <span className="font-semibold text-gray-900">{totalResults}</span>개의 결과
                </p>
                <div className="flex items-center space-x-4">
                  {tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">선택된 태그:</span>
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {/* 검색 결과 목록 */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <article key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {renderHighlightedText(result.title, result.highlights?.title)}
                        </h3>
                        {result.category && (
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                            {result.category}
                          </span>
                        )}
                        {result.score && (
                          <span className="text-xs text-gray-500">
                            관련도: {result.score.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {renderHighlightedText(result.content, result.highlights?.content)}
                      </p>
                      {result.location && (
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {renderHighlightedText(result.location, result.highlights?.location)}
                        </div>
                      )}
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Tag className="w-4 h-4 text-gray-400" />
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{result.user.username}</span>
                        <span>{formatDate(result.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* 검색 결과 없음 */}
          {!loading && results.length === 0 && totalResults === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => performSearch(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => performSearch(pageNum)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        page === pageNum
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => performSearch(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 