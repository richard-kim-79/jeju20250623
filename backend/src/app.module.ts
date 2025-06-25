import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PrismaService } from './prisma.service';
import { S3Module } from './s3/s3.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommentsModule } from './comments/comments.module';
import { CommentsService } from './comments/comments.service';
import { AdsModule } from './ads/ads.module';
import { ApiKeyUsageMiddleware } from './middleware/api-key-usage.middleware';
// import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
// import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    PostsModule,
    S3Module,
    FirebaseModule,
    ApiKeysModule,
    NotificationsModule,
    CommentsModule,
    AdsModule,
    // ElasticsearchModule,
    // SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, CommentsService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyUsageMiddleware).forRoutes('*');
  }
}
