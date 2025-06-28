import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async generateApiKey(userId: number, name: string): Promise<string> {
    const apiKey = `jeju_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    await this.prisma.apiKey.create({
      data: {
        name,
        keyHash,
        userId,
        isActive: true,
      },
    });

    return apiKey;
  }

  async validateApiKey(apiKey: string): Promise<{ userId: number; isValid: boolean }> {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const keyRecord = await this.prisma.apiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!keyRecord) {
      return { userId: 0, isValid: false };
    }

    return { userId: keyRecord.userId, isValid: true };
  }

  async getUserApiKeys(userId: number) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeApiKey(userId: number, keyId: number): Promise<boolean> {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!key) {
      return false;
    }

    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    return true;
  }

  async updateLastUsed(keyId: number): Promise<void> {
    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { lastUsedAt: new Date() },
    });
  }
} 