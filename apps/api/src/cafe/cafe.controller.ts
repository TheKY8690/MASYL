import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CafeService } from './cafe.service';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '@masyl/types';

@ApiTags('cafes')
@Controller('cafes')
export class CafeController {
  constructor(private readonly cafeService: CafeService) {}

  @Get('nearby')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '반경 내 카페 조회' })
  findNearby(@Query() query: NearbyQueryDto) {
    return this.cafeService.findNearby(query);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카페 전체 목록' })
  findAll() {
    return this.cafeService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카페 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.cafeService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카페 등록' })
  create(@Body() dto: CreateCafeDto, @CurrentUser() user: AuthUser) {
    return this.cafeService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카페 수정' })
  update(@Param('id') id: string, @Body() dto: UpdateCafeDto) {
    return this.cafeService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '카페 삭제' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.cafeService.remove(id, user.id);
  }
}
