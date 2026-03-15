import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { joinGroup } from '@/actions/groups';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default async function JoinGroupPage({ params, searchParams }: any) {
  const inviteCode = params.inviteCode;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let userId: string | null = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      userId = decoded.id;
    } catch {}
  }
  if (!userId) {
    redirect(`/auth/sign-in?callbackUrl=/collab/join/${inviteCode}`);
  }
  try {
    const groupId = await joinGroup({ inviteCode, userId });
    redirect(`/groups/${groupId}?joined=1`);
  } catch (e: any) {
    redirect(`/dashboard/worship?error=${encodeURIComponent(e.message)}`);
  }
}
