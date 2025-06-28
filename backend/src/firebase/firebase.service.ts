import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin SDK 초기화 성공');
    } catch (error) {
      console.error('Firebase Admin SDK 초기화 실패:', error);
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.firebaseApp.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new Error('Firebase ID 토큰 검증 실패');
    }
  }

  async createCustomToken(uid: string): Promise<string> {
    try {
      const customToken = await this.firebaseApp.auth().createCustomToken(uid);
      return customToken;
    } catch (error) {
      throw new Error('Firebase 커스텀 토큰 생성 실패');
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.firebaseApp.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      throw new Error('Firebase 사용자 조회 실패');
    }
  }

  async createUser(userData: {
    email: string;
    password?: string;
    displayName?: string;
    photoURL?: string;
  }): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.firebaseApp.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      });
      return userRecord;
    } catch (error) {
      throw new Error('Firebase 사용자 생성 실패');
    }
  }

  async updateUser(uid: string, userData: {
    displayName?: string;
    photoURL?: string;
  }): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.firebaseApp.auth().updateUser(uid, userData);
      return userRecord;
    } catch (error) {
      throw new Error('Firebase 사용자 정보 업데이트 실패');
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await this.firebaseApp.auth().deleteUser(uid);
    } catch (error) {
      throw new Error('Firebase 사용자 삭제 실패');
    }
  }

  async setCustomUserClaims(uid: string, claims: object): Promise<void> {
    try {
      await this.firebaseApp.auth().setCustomUserClaims(uid, claims);
    } catch (error) {
      throw new Error('Firebase 사용자 커스텀 클레임 설정 실패');
    }
  }
} 