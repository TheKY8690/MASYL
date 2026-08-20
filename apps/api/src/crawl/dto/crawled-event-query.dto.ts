import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CrawledEventQueryDto {
  @ApiPropertyOptional({ enum: ['pending', 'processed', 'failed'] })
  @IsOptional()
  @IsIn(['pending', 'processed', 'failed'])
  status?: 'pending' | 'processed' | 'failed';

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
