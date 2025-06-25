import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdsService {
  constructor(private prisma: PrismaService) {}

  // 광고 목록 조회 (활성 광고만)
  async getActiveAds(position?: string) {
    return this.prisma.advertisement.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        ...(position ? { position } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 광고 노출 기록
  async recordImpression(adId: number, ipAddress?: string, userAgent?: string, referrer?: string) {
    return this.prisma.adStat.create({
      data: {
        advertisementId: adId,
        type: 'impression',
        ipAddress,
        userAgent,
        referrer,
      },
    });
  }

  // 광고 클릭 기록
  async recordClick(adId: number, userId?: number, ipAddress?: string, userAgent?: string, referrer?: string) {
    return this.prisma.adStat.create({
      data: {
        advertisementId: adId,
        type: 'click',
        userId,
        ipAddress,
        userAgent,
        referrer,
      },
    });
  }

  // 광고별 통계 집계
  async getAdStats(adId: number) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id: adId },
    });
    if (!ad) throw new NotFoundException('광고를 찾을 수 없습니다.');

    const [impressions, clicks] = await Promise.all([
      this.prisma.adStat.count({ where: { advertisementId: adId, type: 'impression' } }),
      this.prisma.adStat.count({ where: { advertisementId: adId, type: 'click' } }),
    ]);
    return { adId, impressions, clicks };
  }

  // 광고 전체 통계 (관리자)
  async getAllAdStats() {
    const ads = await this.prisma.advertisement.findMany();
    const stats = await Promise.all(
      ads.map(async (ad) => {
        const [impressions, clicks] = await Promise.all([
          this.prisma.adStat.count({ where: { advertisementId: ad.id, type: 'impression' } }),
          this.prisma.adStat.count({ where: { advertisementId: ad.id, type: 'click' } }),
        ]);
        return {
          adId: ad.id,
          title: ad.title,
          impressions,
          clicks,
        };
      })
    );
    return stats;
  }
} 