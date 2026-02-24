
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';

export async function createGroup({ name, description, visibility, adminId }: {
  name: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  adminId: string;
}) {
  const inviteCode = randomBytes(3).toString('hex').toUpperCase();
  const group = await prisma.group.create({
    data: {
      name,
      description,
      visibility,
      inviteCode,
      adminId,
      members: {
        create: {
          userId: adminId,
          role: 'ADMIN',
        },
      },
    },
  });
  revalidatePath('/dashboard/worship');
  return group.id;
}

export async function joinGroup({ inviteCode, userId }: {
  inviteCode: string;
  userId: string;
}) {
  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) throw new Error('Group not found');
  const existing = await prisma.groupMember.findFirst({ where: { groupId: group.id, userId } });
  if (existing) return group.id;
  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId,
      role: 'MEMBER',
    },
  });
  revalidatePath(`/groups/${group.id}`);
  return group.id;
}

export async function syncDhikrCount({ campaignId, countToAdd }: {
  campaignId: string;
  countToAdd: number;
}) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      currentCount: { increment: countToAdd },
    },
  });
  revalidatePath(`/groups`);
  return true;
}
