import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode,
} from '@nestjs/common';
import { DependenciesService } from './dependencies.service';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { UpdateDependencyDto } from './dto/update-dependency.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dependencies')
@UseGuards(JwtAuthGuard)
export class DependenciesController {
  constructor(private readonly service: DependenciesService) {}

  @Get('radar')
  getRadar() {
    return this.service.getRadar();
  }

  @Get('blast-radius/:issueId')
  getBlastRadius(@Param('issueId') issueId: string) {
    return this.service.getBlastRadius(issueId);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateDependencyDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDependencyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
