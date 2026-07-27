import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ description: '제보 대상 카페 UUID' })
  @IsUUID()
  cafeId!: string;

  @ApiPropertyOptional({ description: '보완 제보 시 연결 할 기존할인 UUID' })
  @IsUUID()
  @IsOptional()
  discountId?: string;

  @ApiProperty({ description: '제보 본문' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({
    description: '증빙 이미지 URL배열 (supabase Storage)',
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  imageUrls?: string[];
}
