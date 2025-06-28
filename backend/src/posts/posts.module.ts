import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma.service';
import { S3Module } from '../s3/s3.module';
import { NotificationsModule } from '../notifications/notifications.module';
// import { SearchModule } from '../search/search.module';

@Module({
  imports: [S3Module, NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
  exports: [PostsService],
})
export class PostsModule {}
