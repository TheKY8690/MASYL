import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class NearbyDiscountQueryDto {
  @ApiProperty({ description: '위도', minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat!: number;

  @ApiProperty({ description: '경도', minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng!: number;

  @ApiPropertyOptional({ description: '반경 (km), 기본값 1', default: 1 })
  @IsNumber()
  @Min(0.1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  radius?: number = 1;

  @ApiPropertyOptional({
    description: '한 페이지 결과 수, 기본값 20',
    default: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ description: '건너 뛸 결과 수, 기본값 0', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  offset?: number;
}
