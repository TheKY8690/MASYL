import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NearbyDiscountQueryDto } from './dto/nearby-discount-query.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@ApiTags('discounts')
@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get('nearby')
  @ApiOperation({ summary: '반경 내 할인 조회 (active)' })
  findNearby(@Query() query: NearbyDiscountQueryDto) {
    return this.discountService.findNearby(query);
  }

  @Get('cafe/:cafeId')
  @ApiOperation({ summary: '카페별 할인 목록' })
  findByCafe(@Param('cafeId') cafeId: string) {
    return this.discountService.findByCafe(cafeId);
  }

  @Get()
  @ApiOperation({ summary: '전체 할인 목록' })
  findAll() {
    return this.discountService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '할인 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '할인 등록' })
  create(@Body() dto: CreateDiscountDto) {
    return this.discountService.create(dto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: '할인 승인' })
  approve(@Param('id') id: string) {
    return this.discountService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: '할인 거절' })
  reject(@Param('id') id: string) {
    return this.discountService.reject(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '할인 수정' })
  update(@Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    return this.discountService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '할인 삭제' })
  remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }
}
