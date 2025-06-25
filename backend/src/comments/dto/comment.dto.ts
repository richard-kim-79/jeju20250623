import { IsString, IsNotEmpty, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: '댓글 내용' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @ApiProperty({ description: '게시글 ID' })
  @IsNumber()
  postId: number;

  @ApiProperty({ description: '부모 댓글 ID (대댓글인 경우)', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}

export class UpdateCommentDto {
  @ApiProperty({ description: '댓글 내용' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
} 