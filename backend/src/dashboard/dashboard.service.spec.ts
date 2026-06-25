import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    organization: { findFirst: jest.fn() },
    board: { count: jest.fn() },
    issue: { count: jest.fn(), groupBy: jest.fn() },
    sprint: { count: jest.fn(), findMany: jest.fn(), groupBy: jest.fn() },
    teamMember: { count: jest.fn() },
    auditLog: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should return dashboard stats', async () => {
    mockPrisma.organization.findFirst.mockResolvedValue({
      planTier: 'pro',
      analyticsEnabled: true,
    });
    mockPrisma.board.count.mockResolvedValue(3);
    mockPrisma.issue.count
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(18);
    mockPrisma.sprint.count.mockResolvedValue(2);
    mockPrisma.sprint.findMany.mockResolvedValue([
      { velocity: 24 },
      { velocity: 30 },
    ]);
    mockPrisma.teamMember.count.mockResolvedValue(8);

    const stats = await service.getStats();

    expect(stats).toEqual({
      totalBoards: 3,
      totalIssues: 42,
      activeSprints: 2,
      completedIssues: 18,
      velocityAvg: 27,
      teamSize: 8,
      organization: { planTier: 'pro', analyticsEnabled: true },
    });
  });
});
