import { Module } from '@nestjs/common';
import { CycleAnalyticsController } from './cycle-analytics.controller';
import { CycleAnalyticsService } from './cycle-analytics.service';

@Module({
  controllers: [CycleAnalyticsController],
  providers: [CycleAnalyticsService],
})
export class CycleAnalyticsModule {}
