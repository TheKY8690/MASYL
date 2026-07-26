import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export enum DiscountTypeEnum {
  PERCENT = 'percent',
  AMOUNT = 'amount',
  FREE_ITEM = 'free_item',
  OTHER = 'other',
}

export enum DiscountSourceTypeEnum {
  AUTO_CRAWL = 'auto_crawl',
  USER_REPORT = 'user_report',
  SELLER_REGISTERED = 'seller_registered',
}

export class CreateDiscountDto {
  @ApiProperty({ description: '할인 대상 카페 UUID' })
  @IsUUID()
  cafeId!: string;

  @ApiProperty({ description: '할인명, 목록/카드 UI에 표시', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ description: '상세 설명, 상세페이지에 표시' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DiscountTypeEnum, description: '할인 유형' })
  @IsEnum(DiscountTypeEnum)
  discountType!: DiscountTypeEnum;

  @ApiProperty({
    description: '할인 값, 예: "10%", "500원", "아메리카노 1잔"',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  discountValue!: string;

  @ApiProperty({ enum: DiscountSourceTypeEnum, description: '출처 구분' })
  @IsEnum(DiscountSourceTypeEnum)
  sourceType!: DiscountSourceTypeEnum;

  @ApiPropertyOptional({
    description: '할인 시작일 (ISO8601), null이면 즉시 유효',
  })
  @IsISO8601()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({
    description: '할인 종료일 (ISO8601), null이면 기간 무제한',
  })
  @IsISO8601()
  @IsOptional()
  validUntil?: string;
}
