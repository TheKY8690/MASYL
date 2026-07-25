import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCafeDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() address!: string;

  @ApiProperty({ minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude!: number;

  @ApiProperty({ minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude!: number;

  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() websiteUrl?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() instagramHandle?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() kakaoPlaceId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() naverPlaceId?: string;
}
