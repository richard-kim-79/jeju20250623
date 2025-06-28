import { Injectable, NestMiddleware, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyUsageMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return next(); // API 키가 없으면 다음 미들웨어로 진행
    }

    try {
      // API 키 검증
      const keyRecord = await this.prisma.apiKey.findFirst({
        where: {
          keyHash: apiKey,
          isActive: true,
        },
        include: {
          plan: true,
        },
      });

      if (!keyRecord) {
        throw new UnauthorizedException('유효하지 않은 API 키입니다.');
      }

      // 사용량 제한 확인
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [dailyUsage, monthlyUsage] = await Promise.all([
        this.prisma.apiKeyUsage.count({
          where: {
            apiKeyId: keyRecord.id,
            createdAt: {
              gte: today,
            },
          },
        }),
        this.prisma.apiKeyUsage.count({
          where: {
            apiKeyId: keyRecord.id,
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), 1),
            },
          },
        }),
      ]);

      // 일일 제한 확인
      if (keyRecord.plan && dailyUsage >= keyRecord.plan.dailyLimit) {
        throw new HttpException('일일 API 사용량 한도를 초과했습니다.', HttpStatus.TOO_MANY_REQUESTS);
      }

      // 월간 제한 확인
      if (keyRecord.plan && monthlyUsage >= keyRecord.plan.monthlyLimit) {
        throw new HttpException('월간 API 사용량 한도를 초과했습니다.', HttpStatus.TOO_MANY_REQUESTS);
      }

      // 사용량 기록
      await this.prisma.apiKeyUsage.create({
        data: {
          apiKeyId: keyRecord.id,
          endpoint: req.path,
          method: req.method,
          statusCode: 200, // 실제 응답 코드는 나중에 업데이트
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      // API 키 마지막 사용 시간 업데이트
      await this.prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() },
      });

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('API 키 검증 중 오류가 발생했습니다.');
    }
  }
} 