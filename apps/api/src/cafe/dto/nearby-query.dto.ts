import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyQueryDto {
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
  radius?: number;
}
