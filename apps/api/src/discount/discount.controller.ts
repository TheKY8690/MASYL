import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NearbyDiscountQueryDto } from './dto/nearby-discount-query.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { AuthGuard } from '../auth/auth.guard';
import type { AuthUser } from '@masyl/types';
import { CurrentUser } from '../auth/current-user.decorator';

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
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '전체 할인 목록 (amdin=전체, user=active만)' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.discountService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '할인 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '할인 등록' })
  create(@Body() dto: CreateDiscountDto, @CurrentUser() user: AuthUser) {
    return this.discountService.create(dto, user.id);
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '할인 승인' })
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.discountService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '할인 거절' })
  reject(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.discountService.reject(id, user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '할인 수정' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiscountDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.discountService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '할인 삭제' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.discountService.remove(id, user.id);
  }
}
