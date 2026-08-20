import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ description: '브랜드명', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: '크롤링 대상 이벤트 페이지 URL' })
  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: '로고 이미지 URL' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}
