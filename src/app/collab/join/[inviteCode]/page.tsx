import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { joinGroup } from '@/actions/groups';

export default async function JoinGroupPage({ params, searchParams }: any) {
  const inviteCode = params.inviteCode;
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect(`/auth/sign-in?callbackUrl=/collab/join/${inviteCode}`);
  }
  try {
    const groupId = await joinGroup({ inviteCode, userId: session.user.id });
    // Optionally, set a success toast here via cookies or searchParams
    redirect(`/groups/${groupId}?joined=1`);
  } catch (e: any) {
    redirect(`/dashboard/worship?error=${encodeURIComponent(e.message)}`);
  }
}
