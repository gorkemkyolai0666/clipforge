import { Controller, Get, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { TriageService } from './triage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTriageRuleDto } from './dto/create-triage-rule.dto';

@Controller('triage')
@UseGuards(JwtAuthGuard)
export class TriageController {
  constructor(private readonly service: TriageService) {}

  @Get('inbox')
  getInbox() {
    return this.service.getInbox();
  }

  @Get('rules')
  findRules() {
    return this.service.findRules();
  }

  @Post('rules')
  @HttpCode(201)
  createRule(@Body() dto: CreateTriageRuleDto) {
    return this.service.createRule(dto);
  }
}
