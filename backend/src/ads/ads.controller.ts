import { Controller, Get, Post, Param, Query, Req, Body } from '@nestjs/common';
import { AdsService } from './ads.service';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // 광고 목록 조회 (위치별)
  @Get()
  async getAds(@Query('position') position?: string) {
    return this.adsService.getActiveAds(position);
  }

  // 광고 노출 기록
  @Post(':id/impression')
  async recordImpression(@Param('id') id: string, @Req() req) {
    return this.adsService.recordImpression(
      parseInt(id),
      req.ip,
      req.headers['user-agent'],
      req.headers['referer'] || req.headers['referrer']
    );
  }

  // 광고 클릭 기록
  @Post(':id/click')
  async recordClick(@Param('id') id: string, @Req() req, @Body() body: { userId?: number }) {
    return this.adsService.recordClick(
      parseInt(id),
      body.userId,
      req.ip,
      req.headers['user-agent'],
      req.headers['referer'] || req.headers['referrer']
    );
  }

  // 광고별 통계 조회
  @Get(':id/stats')
  async getAdStats(@Param('id') id: string) {
    return this.adsService.getAdStats(parseInt(id));
  }

  // 전체 광고 통계 (관리자)
  @Get('stats/all')
  async getAllAdStats() {
    return this.adsService.getAllAdStats();
  }
} 