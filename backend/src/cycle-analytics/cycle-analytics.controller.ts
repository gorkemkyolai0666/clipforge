import { Controller, Get, UseGuards } from '@nestjs/common';
import { CycleAnalyticsService } from './cycle-analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cycle-analytics')
@UseGuards(JwtAuthGuard)
export class CycleAnalyticsController {
  constructor(private readonly service: CycleAnalyticsService) {}

  @Get('heatmap')
  getHeatmap() {
    return this.service.getHeatmap();
  }

  @Get('forecast')
  getForecast() {
    return this.service.getForecast();
  }
}
