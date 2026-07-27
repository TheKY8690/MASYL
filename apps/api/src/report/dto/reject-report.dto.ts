import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RejectReportDto {
  @ApiProperty({ description: '거절 사유' })
  @IsString()
  rejectReason!: string;
}
