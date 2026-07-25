import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CafeService } from './cafe.service';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';

@ApiTags('cafes')
@Controller('cafes')
export class CafeController {
  constructor(private readonly cafeService: CafeService) {}

  @Get('nearby')
  @ApiOperation({ summary: '반경 내 카페 조회' })
  findNearby(@Query() query: NearbyQueryDto) {
    return this.cafeService.findNearby(query);
  }

  @Get()
  @ApiOperation({ summary: '카페 전체 목록' })
  findAll() {
    return this.cafeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '카페 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.cafeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '카페 등록' })
  create(@Body() dto: CreateCafeDto) {
    return this.cafeService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '카페 수정' })
  update(@Param('id') id: string, @Body() dto: UpdateCafeDto) {
    return this.cafeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '카페 삭제' })
  remove(@Param('id') id: string) {
    return this.cafeService.remove(id);
  }
}
