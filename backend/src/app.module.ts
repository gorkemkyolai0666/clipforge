import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { IssuesModule } from './issues/issues.module';
import { SprintsModule } from './sprints/sprints.module';
import { DependenciesModule } from './dependencies/dependencies.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CeremoniesModule } from './ceremonies/ceremonies.module';
import { LabelsModule } from './labels/labels.module';
import { CommentsModule } from './comments/comments.module';
import { SettingsModule } from './settings/settings.module';
import { TriageModule } from './triage/triage.module';
import { CycleAnalyticsModule } from './cycle-analytics/cycle-analytics.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    DashboardModule,
    OrganizationsModule,
    BoardsModule,
    ColumnsModule,
    IssuesModule,
    SprintsModule,
    DependenciesModule,
    TeamMembersModule,
    AuditLogsModule,
    CeremoniesModule,
    LabelsModule,
    CommentsModule,
    SettingsModule,
    TriageModule,
    CycleAnalyticsModule,
  ],
})
export class AppModule {}
