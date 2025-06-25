import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, PostsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {} 