# Database Setup Guide

## Overview
This guide helps you connect Deenify to a real database. Currently using mock data for demonstration.

## Recommended Database Options

### 1. **Firebase/Firestore** (Recommended for quick start)
- Real-time updates
- Easy authentication
- Generous free tier

```bash
npm install firebase firebase-admin
```

Setup in `src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### 2. **Supabase** (PostgreSQL with real-time)
- Open source
- PostgreSQL database
- Built-in authentication

```bash
npm install @supabase/supabase-js
```

### 3. **Prisma + PostgreSQL/MySQL**
- Type-safe database client
- Migrations support
- Works with any SQL database

```bash
npm install prisma @prisma/client
npx prisma init
```

## Database Schema

See `src/lib/database-types.ts` for complete TypeScript types.

### Core Collections/Tables

1. **users** - User profiles and authentication
2. **courses** - All courses (free and specialized)
3. **enrollments** - Student course enrollments
4. **lessons** - Course lessons and content
5. **reflections** - Daily Quranic reflections
6. **verification_requests** - Course verification queue
7. **teaching_sessions** - 1:1 and group classes
8. **dhikr_entries** - Dhikr counter data
9. **khatm_circles** - Quran Khatm tracking
10. **achievements** - Badge/achievement system

## Implementation Steps

### Step 1: Choose Your Database
Pick one of the options above and install the required packages.

### Step 2: Update Environment Variables
Create `.env.local`:

```env
# Database
DATABASE_URL="your-connection-string"

# If using Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project

# If using Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Auth (optional - for NextAuth.js)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret
```

### Step 3: Update API Routes

Replace mock data in these files:
- `src/app/api/library/route.ts` - Fetch courses from database
- `src/app/api/courses/submit/route.ts` - Save course submissions
- `src/app/api/verification/queue/route.ts` - Fetch verification queue
- `src/app/api/verification/[courseId]/route.ts` - Approve/reject courses

Example with Firestore:
```typescript
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET() {
  const coursesRef = collection(db, 'courses');
  const q = query(coursesRef, where('status', '==', 'approved'));
  const snapshot = await getDocs(q);
  
  const courses = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  return NextResponse.json({ freeCourses: courses, ... });
}
```

### Step 4: Implement Authentication

We recommend **NextAuth.js** for authentication:

```bash
npm install next-auth @auth/firebase-adapter
```

Create `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  // ... configure callbacks for role management
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Step 5: Update Auth Context

Replace mock user in `src/lib/auth-context.tsx` with real session:

```typescript
import { useSession } from 'next-auth/react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role, // Set role in JWT callback
  } : null;
  
  // ...
}
```

## Security Considerations

### 1. Role-Based Access Control
- Verify user roles on server-side (API routes)
- Never trust client-side role checks alone
- Use middleware for protected routes

### 2. Course Verification
- Only approved verifiers can approve/reject courses
- Log all verification actions
- Notify teachers of status changes

### 3. Payment Processing
For specialized/paid courses, integrate:
- **Stripe** for payments
- **PayPal** as alternative
- Store transaction records
- Handle refunds appropriately

### 4. Content Moderation
- All courses must go through verification
- Implement reporting system for inappropriate content
- Have clear community guidelines

## Data Migration

If moving from mock to real data:

1. Export current structure as JSON
2. Write migration script to seed database
3. Test with small dataset first
4. Update all API endpoints
5. Test thoroughly before going live

## Performance Optimization

### Caching
```typescript
// Example with React Query
import { useQuery } from '@tanstack/react-query';

function useLibrary() {
  return useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await fetch('/api/library');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Indexing
Create indexes on:
- `courses.status`
- `courses.category`
- `courses.teacherId`
- `enrollments.userId`
- `verification_requests.status`

## Testing

Create test data:
```bash
npm run seed-database
```

Create `scripts/seed-database.ts` with sample courses and users.

## Support

For database-specific questions:
- Firestore: https://firebase.google.com/docs/firestore
- Supabase: https://supabase.com/docs
- Prisma: https://www.prisma.io/docs

## Next Steps

1. ✅ Choose your database
2. ✅ Set up authentication
3. ✅ Implement course submission
4. ✅ Create verification workflow
5. ✅ Add payment processing (for paid courses)
6. ✅ Set up email notifications
7. ✅ Deploy to production
