import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import * as bcrypt from 'bcrypt';

interface SocialUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider: 'google' | 'kakao' | 'naver';
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) {}

  // 비밀번호 정책 검증
  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      throw new BadRequestException('비밀번호는 최소 하나의 소문자를 포함해야 합니다.');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      throw new BadRequestException('비밀번호는 최소 하나의 대문자를 포함해야 합니다.');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      throw new BadRequestException('비밀번호는 최소 하나의 숫자를 포함해야 합니다.');
    }
    
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      throw new BadRequestException('비밀번호는 최소 하나의 특수문자를 포함해야 합니다.');
    }
  }

  // 비밀번호 해시화 (salt rounds: 12로 증가)
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  // 비밀번호 검증
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.password && await this.verifyPassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    // 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 비밀번호 확인
    if (!user.password) {
      throw new UnauthorizedException('소셜 로그인 계정입니다.');
    }
    
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // 마지막 로그인 시간 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // JWT 토큰 생성
    const token = this.jwtService.sign({ 
      userId: user.id, 
      email: user.email 
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async signup(email: string, password: string, username: string) {
    // 비밀번호 정책 검증
    this.validatePassword(password);

    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 사용자명 중복 확인
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictException('이미 존재하는 사용자명입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await this.hashPassword(password);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    const { password: _, ...result } = user;

    // JWT 토큰 생성
    const token = this.jwtService.sign({ 
      userId: user.id, 
      email: user.email 
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  // 비밀번호 변경 기능 추가
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }

    // 새 비밀번호 정책 검증
    this.validatePassword(newPassword);

    // 새 비밀번호 해시화
    const hashedNewPassword = await this.hashPassword(newPassword);

    // 비밀번호 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }

  async socialLogin(socialUser: SocialUser) {
    try {
      // 기존 사용자 확인
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(socialUser.email ? [{ email: socialUser.email }] : []),
            { firebaseUid: socialUser.uid }
          ]
        }
      });

      if (!user) {
        // 새 사용자 생성
        const username = await this.generateUniqueUsername(socialUser.displayName || 'user');
        
        user = await this.prisma.user.create({
          data: {
            email: socialUser.email || `${socialUser.uid}@social.local`,
            username,
            firebaseUid: socialUser.uid,
            profileImage: socialUser.photoURL,
            socialProvider: socialUser.provider,
          },
        });
      } else {
        // 기존 사용자 정보 업데이트
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            firebaseUid: socialUser.uid,
            profileImage: socialUser.photoURL,
            socialProvider: socialUser.provider,
            lastLoginAt: new Date(),
          },
        });
      }

      // JWT 토큰 생성
      const payload = { email: user.email, sub: user.id };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          profileImage: user.profileImage,
          socialProvider: user.socialProvider,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('소셜 로그인에 실패했습니다.');
    }
  }

  async verifyFirebaseToken(idToken: string) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      
      // Firebase 사용자 정보 조회
      const firebaseUser = await this.firebaseService.getUserByUid(decodedToken.uid);
      
      // 소셜 로그인 처리
      const socialUser: SocialUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        provider: this.detectProvider(decodedToken),
      };

      return await this.socialLogin(socialUser);
    } catch (error) {
      throw new UnauthorizedException('Firebase 토큰 검증에 실패했습니다.');
    }
  }

  private detectProvider(decodedToken: any): 'google' | 'kakao' | 'naver' {
    // Firebase 토큰에서 제공자 정보 추출
    if (decodedToken.firebase?.sign_in_provider) {
      const provider = decodedToken.firebase.sign_in_provider;
      if (provider === 'google.com') return 'google';
      if (provider === 'kakao.com') return 'kakao';
      if (provider === 'naver.com') return 'naver';
    }
    
    // 기본값은 Google
    return 'google';
  }

  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let counter = 1;
    
    while (true) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      });
      
      if (!existingUser) {
        return username;
      }
      
      username = `${baseUsername}${counter}`;
      counter++;
    }
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        profileImage: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async updateProfile(userId: number, data: { username?: string; profileImage?: string }) {
    // 사용자명 중복 확인
    if (data.username) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('이미 존재하는 사용자명입니다.');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        profileImage: true,
        socialProvider: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return user;
  }
}
