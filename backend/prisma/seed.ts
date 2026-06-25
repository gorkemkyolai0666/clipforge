import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function daysFromNow(days: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const demoEmail = 'demo@clipforge.com.tr';

  const org = await prisma.organization.upsert({
    where: { id: 'org-clipforge-demo' },
    update: {},
    create: {
      id: 'org-clipforge-demo',
      name: 'Video İşbirliği A.Ş.',
      slug: 'video-isbirligi',
      address: 'Maslak Mah. Büyükdere Cad. No:255, Sarıyer / İstanbul',
      phone: '0212 555 01 23',
      email: 'info@clipforge.com.tr',
      planTier: 'pro',
      maxBoards: 15,
      maxUsers: 50,
      aiCredits: 87,
      analyticsEnabled: true,
    },
  });

  const passwordHash = await bcrypt.hash('demo123456', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      password: passwordHash,
      name: 'Ayşe Yılmaz',
      role: 'admin',
    },
  });

  const poUser = await prisma.user.upsert({
    where: { email: 'po@clipforge.com.tr' },
    update: {},
    create: {
      email: 'po@clipforge.com.tr',
      password: passwordHash,
      name: 'Mehmet Kaya',
      role: 'product_owner',
    },
  });

  const devUser = await prisma.user.upsert({
    where: { email: 'dev@clipforge.com.tr' },
    update: {},
    create: {
      email: 'dev@clipforge.com.tr',
      password: passwordHash,
      name: 'Zeynep Demir',
      role: 'developer',
    },
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: 'izleyici@clipforge.com.tr' },
    update: {},
    create: {
      email: 'izleyici@clipforge.com.tr',
      password: passwordHash,
      name: 'Can Öztürk',
      role: 'viewer',
    },
  });

  await prisma.teamMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: demoUser.id } },
    update: {},
    create: { organizationId: org.id, userId: demoUser.id, role: 'admin', joinedAt: daysFromNow(-180) },
  });
  await prisma.teamMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: poUser.id } },
    update: {},
    create: { organizationId: org.id, userId: poUser.id, role: 'product_owner', joinedAt: daysFromNow(-120) },
  });
  await prisma.teamMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: devUser.id } },
    update: {},
    create: { organizationId: org.id, userId: devUser.id, role: 'developer', joinedAt: daysFromNow(-90) },
  });
  await prisma.teamMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: viewerUser.id } },
    update: {},
    create: { organizationId: org.id, userId: viewerUser.id, role: 'viewer', joinedAt: daysFromNow(-30) },
  });

  const boardProduct = await prisma.board.upsert({
    where: { id: 'board-urun-gelistirme' },
    update: {},
    create: {
      id: 'board-urun-gelistirme',
      organizationId: org.id,
      name: 'Dosya Sürümü Geliştirme',
      description: 'ClipForge çekirdek dosya sürümü kanban klipsı',
    },
  });

  const boardMobile = await prisma.board.upsert({
    where: { id: 'board-mobil-uygulama' },
    update: {},
    create: {
      id: 'board-mobil-uygulama',
      organizationId: org.id,
      name: 'Mobil Uygulama',
      description: 'iOS ve Android istemci geliştirme klipsı',
    },
  });

  const colBacklog = await prisma.column.upsert({
    where: { id: 'col-backlog' },
    update: {},
    create: { id: 'col-backlog', boardId: boardProduct.id, name: 'Bekleme Listesi', position: 0 },
  });
  const colTodo = await prisma.column.upsert({
    where: { id: 'col-todo' },
    update: {},
    create: { id: 'col-todo', boardId: boardProduct.id, name: 'Yapılacak', position: 1, wipLimit: 8 },
  });
  const colProgress = await prisma.column.upsert({
    where: { id: 'col-progress' },
    update: {},
    create: { id: 'col-progress', boardId: boardProduct.id, name: 'Devam Ediyor', position: 2, wipLimit: 5 },
  });
  const colReview = await prisma.column.upsert({
    where: { id: 'col-review' },
    update: {},
    create: { id: 'col-review', boardId: boardProduct.id, name: 'İnceleme', position: 3, wipLimit: 4 },
  });
  const colDone = await prisma.column.upsert({
    where: { id: 'col-done' },
    update: {},
    create: { id: 'col-done', boardId: boardProduct.id, name: 'Tamamlandı', position: 4 },
  });

  const labelBug = await prisma.label.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Hata' } },
    update: {},
    create: { organizationId: org.id, name: 'Hata', color: '#ef4444' },
  });
  const labelFeature = await prisma.label.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Özellik' } },
    update: {},
    create: { organizationId: org.id, name: 'Özellik', color: '#FF6B4A' },
  });
  const labelTechDebt = await prisma.label.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Teknik Borç' } },
    update: {},
    create: { organizationId: org.id, name: 'Teknik Borç', color: '#f59e0b' },
  });

  const sprintPrev = await prisma.sprint.upsert({
    where: { id: 'sprint-24-onceki' },
    update: {},
    create: {
      id: 'sprint-24-onceki',
      boardId: boardProduct.id,
      name: 'Sprint 24',
      goal: 'Velocity hesaplama ve burndown grafikleri',
      status: 'completed',
      startDate: daysFromNow(-28),
      endDate: daysFromNow(-14),
      velocity: 26,
    },
  });

  const sprintActive = await prisma.sprint.upsert({
    where: { id: 'sprint-25-aktif' },
    update: {},
    create: {
      id: 'sprint-25-aktif',
      boardId: boardProduct.id,
      name: 'Sprint 25',
      goal: 'Bağımlılık grafiği ve KVKK denetim izi',
      status: 'active',
      startDate: daysFromNow(-7),
      endDate: daysFromNow(7),
    },
  });

  const issueAuth = await prisma.issue.upsert({
    where: { id: 'issue-jwt-auth' },
    update: {},
    create: {
      id: 'issue-jwt-auth',
      boardId: boardProduct.id,
      columnId: colDone.id,
      title: 'JWT kimlik doğrulama modülü',
      description: 'Giriş, dosya sürümü ve profil uç noktaları',
      priority: 'high',
      status: 'done',
      storyPoints: 5,
      assigneeId: devUser.id,
      reporterId: poUser.id,
      position: 0,
    },
  });

  const issueDeps = await prisma.issue.upsert({
    where: { id: 'issue-dependency-graph' },
    update: {},
    create: {
      id: 'issue-dependency-graph',
      boardId: boardProduct.id,
      columnId: colProgress.id,
      title: 'Çapraz klip bağımlılık grafiği',
      description: 'Blocks/blocked-by ilişkileri ve kritik yol vurgulama',
      priority: 'critical',
      status: 'in_progress',
      storyPoints: 8,
      assigneeId: devUser.id,
      reporterId: poUser.id,
      position: 0,
      dueDate: daysFromNow(5),
    },
  });

  const issueAudit = await prisma.issue.upsert({
    where: { id: 'issue-audit-log' },
    update: {},
    create: {
      id: 'issue-audit-log',
      boardId: boardProduct.id,
      columnId: colTodo.id,
      title: 'KVKK uyumlu denetim günlüğü',
      description: 'Tüm CRUD işlemlerinin izlenebilir kaydı',
      priority: 'high',
      status: 'todo',
      storyPoints: 5,
      assigneeId: devUser.id,
      reporterId: demoUser.id,
      position: 1,
    },
  });

  const issueMobile = await prisma.issue.upsert({
    where: { id: 'issue-push-notif' },
    update: {},
    create: {
      id: 'issue-push-notif',
      boardId: boardMobile.id,
      title: 'Push bildirim entegrasyonu',
      description: 'Sprint başlangıç ve görev atama bildirimleri',
      priority: 'medium',
      status: 'backlog',
      storyPoints: 3,
      reporterId: poUser.id,
      position: 0,
    },
  });

  await prisma.sprintIssue.upsert({
    where: { sprintId_issueId: { sprintId: sprintActive.id, issueId: issueDeps.id } },
    update: {},
    create: { sprintId: sprintActive.id, issueId: issueDeps.id },
  });
  await prisma.sprintIssue.upsert({
    where: { sprintId_issueId: { sprintId: sprintActive.id, issueId: issueAudit.id } },
    update: {},
    create: { sprintId: sprintActive.id, issueId: issueAudit.id },
  });
  await prisma.sprintIssue.upsert({
    where: { sprintId_issueId: { sprintId: sprintPrev.id, issueId: issueAuth.id } },
    update: {},
    create: { sprintId: sprintPrev.id, issueId: issueAuth.id },
  });

  await prisma.dependency.upsert({
    where: {
      issueId_dependsOnIssueId_type: {
        issueId: issueDeps.id,
        dependsOnIssueId: issueAuth.id,
        type: 'blocked_by',
      },
    },
    update: {},
    create: {
      issueId: issueDeps.id,
      dependsOnIssueId: issueAuth.id,
      type: 'blocked_by',
    },
  });

  await prisma.issueLabel.upsert({
    where: { issueId_labelId: { issueId: issueDeps.id, labelId: labelFeature.id } },
    update: {},
    create: { issueId: issueDeps.id, labelId: labelFeature.id },
  });
  await prisma.issueLabel.upsert({
    where: { issueId_labelId: { issueId: issueAudit.id, labelId: labelTechDebt.id } },
    update: {},
    create: { issueId: issueAudit.id, labelId: labelTechDebt.id },
  });

  await prisma.comment.upsert({
    where: { id: 'comment-deps-review' },
    update: {},
    create: {
      id: 'comment-deps-review',
      issueId: issueDeps.id,
      authorId: poUser.id,
      body: 'Kritik yol analizi için D3.js yerine mevcut repo kütüphanesini kullanalım.',
    },
  });

  await prisma.ceremony.upsert({
    where: { id: 'ceremony-standup' },
    update: {},
    create: {
      id: 'ceremony-standup',
      organizationId: org.id,
      boardId: boardProduct.id,
      type: 'standup',
      title: 'Günlük Standup',
      scheduledAt: daysFromNow(1, 9, 30),
      durationMinutes: 15,
      notes: 'Zoom bağlantısı: standup.clipforge.com.tr',
    },
  });

  await prisma.ceremony.upsert({
    where: { id: 'ceremony-retro' },
    update: {},
    create: {
      id: 'ceremony-retro',
      organizationId: org.id,
      boardId: boardProduct.id,
      type: 'retrospective',
      title: 'Sprint 25 Retrospektifi',
      scheduledAt: daysFromNow(8, 14, 0),
      durationMinutes: 60,
      notes: 'Mad, Sad, Glad formatı kullanılacak',
    },
  });

  await prisma.auditLog.upsert({
    where: { id: 'audit-sprint-start' },
    update: {},
    create: {
      id: 'audit-sprint-start',
      organizationId: org.id,
      userId: poUser.id,
      action: 'sprint.started',
      entityType: 'Sprint',
      entityId: sprintActive.id,
      metadata: JSON.stringify({ sprintName: 'Sprint 25', boardName: 'Dosya Sürümü Geliştirme' }),
    },
  });

  await prisma.triageRule.upsert({
    where: { id: 'triage-rule-auth' },
    update: {},
    create: {
      id: 'triage-rule-auth',
      organizationId: org.id,
      name: 'Auth issue otomatik atama',
      labelPattern: 'auth',
      assigneeId: devUser.id,
      isActive: true,
    },
  });

  await prisma.triageRule.upsert({
    where: { id: 'triage-rule-api' },
    update: {},
    create: {
      id: 'triage-rule-api',
      organizationId: org.id,
      name: 'API issue öncelik yükseltme',
      labelPattern: 'api',
      priority: 'high',
      isActive: true,
    },
  });

  console.log('ClipForge seed tamamlandı.');
  console.log(`Demo kullanıcı: ${demoEmail} / demo123456`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
