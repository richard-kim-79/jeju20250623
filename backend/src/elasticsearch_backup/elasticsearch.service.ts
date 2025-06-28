import { Injectable, OnModuleInit } from '@nestjs/common';
// import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';

interface SearchOptions {
  query: string;
  category?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'popularity';
}

interface PostDocument {
  id: number;
  title: string;
  content: string;
  location?: string;
  category?: string;
  tags?: string[];
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
  commentCount?: number;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  // private client: Client;
  private readonly indexName = 'jeju-posts';

  constructor(private configService: ConfigService) {
    // this.client = new Client({
    //   node: this.configService.get('ELASTICSEARCH_URL') || 'http://localhost:9200',
    //   auth: {
    //     username: this.configService.get('ELASTICSEARCH_USERNAME') || 'elastic',
    //     password: this.configService.get('ELASTICSEARCH_PASSWORD') || 'changeme',
    //   },
    // });
  }

  async onModuleInit() {
    // await this.createIndex();
    console.log('Elasticsearch 서비스가 비활성화되었습니다.');
  }

  // private async createIndex() {
  //   // 임시 비활성화
  // }

  async indexPost(post: PostDocument) {
    // 임시 비활성화
    console.log('Elasticsearch 인덱싱이 비활성화되었습니다.');
  }

  async updatePost(post: PostDocument) {
    // 임시 비활성화
    console.log('Elasticsearch 업데이트가 비활성화되었습니다.');
  }

  async deletePost(postId: number) {
    // 임시 비활성화
    console.log('Elasticsearch 삭제가 비활성화되었습니다.');
  }

  async search(options: SearchOptions) {
    // 임시 비활성화
    console.log('Elasticsearch 검색이 비활성화되었습니다.');
    return {
      hits: [],
      total: 0,
      aggregations: {},
      page: options.page || 1,
      limit: options.limit || 10,
      totalPages: 0,
    };
  }

  async getSuggestions(query: string, field: string = 'title') {
    // 임시 비활성화
    return [];
  }

  async getPopularSearches() {
    // 임시 비활성화
    return [];
  }

  async getRelatedPosts(postId: number, limit: number = 5) {
    // 임시 비활성화
    return [];
  }
} 