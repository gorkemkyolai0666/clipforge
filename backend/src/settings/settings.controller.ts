import { Controller, Get, Patch, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AddCreditsDto } from './dto/add-credits.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  get() {
    return this.service.getSettings();
  }

  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.service.update(dto);
  }

  @Post('credits')
  @HttpCode(200)
  addCredits(@Body() dto: AddCreditsDto) {
    return this.service.addCredits(dto.amount);
  }
}
