import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('brands')
@Controller('brands')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @ApiOperation({ summary: '브랜드 목록' })
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '브랜드 단건 조회' })
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '브랜드 등록 (admin)' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '브랜드 수정 (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '브랜드 삭제 (admin)' })
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
