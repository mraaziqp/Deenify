# Deenify - Complete Islamic Learning Platform

## 🎉 What's New - Full Course Management System

A comprehensive platform for Islamic education with real course submission, verification workflow, and role-based access control.

### ✨ Major Features Implemented

#### 1. **Multi-Role System**
- **Students**: Enroll in courses, track progress, earn achievements
- **Teachers**: Submit courses for review, offer teaching services
- **Verifiers**: Review and approve/reject course submissions
- **Admins**: Full system access

#### 2. **Course Management**
- Free courses (main library)
- Specialized/paid courses (requires verification)
- Real-time course submission workflow
- Teacher portal for managing submissions
- Verifier dashboard for approvals

#### 3. **Verification Workflow**
- All courses must be verified before publication
- Detailed review process with feedback
- Status tracking (pending/approved/rejected)
- Email notifications (ready to implement)

#### 4. **Enhanced Features**
- Learning streak tracking
- Weekly activity visualization
- Achievement/badge system
- Daily prayer reminders
- Global Dhikr circle
- Quran Khatm tracking
- Interactive onboarding
- Comprehensive settings page

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── library/          # Course data endpoint
│   │   ├── courses/submit/   # Course submission
│   │   └── verification/     # Approval workflow
│   └── (main)/
│       ├── dashboard/        # Main dashboard
│       ├── library/          # Course library
│       ├── teacher/          # Teacher portal
│       ├── verifier/         # Verifier dashboard
│       ├── profile/          # User profile
│       └── settings/         # Settings page
├── components/
│   ├── daily-reminders.tsx   # Prayer reminders widget
│   └── layout/
│       ├── header.tsx
│       └── sidebar.tsx       # Role-based navigation
└── lib/
    ├── auth-context.tsx      # Authentication & roles
    ├── database-types.ts     # Full schema types
    └── utils.ts
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3001

### 3. Test Different Roles

Edit `src/lib/auth-context.tsx` line 29 to test different roles:
```typescript
role: 'student',  // or 'teacher', 'verifier', 'admin'
```

## 🔧 Next Steps - Connecting Real Database

### Step 1: Choose Your Database
We recommend **Firebase/Firestore** for quick start or **Supabase** for open-source PostgreSQL.

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed instructions.

### Step 2: Set Up Authentication
```bash
npm install next-auth @auth/firebase-adapter
```

Configure NextAuth.js with your auth provider (Google, Email, etc.)

### Step 3: Update API Routes
Replace mock data in:
- `src/app/api/library/route.ts`
- `src/app/api/courses/submit/route.ts`
- `src/app/api/verification/queue/route.ts`
- `src/app/api/verification/[courseId]/route.ts`

### Step 4: Deploy
```bash
npm run build
# Deploy to Vercel, Netlify, or your preferred platform
```

## 🎯 Key Pages

### For Students
- **/dashboard** - Learning progress and stats
- **/library** - Browse and enroll in courses
- **/dhikr** - Global Dhikr counter
- **/profile** - Track achievements and streaks

### For Teachers
- **/teacher** - Submit courses for verification
- **/library** - View submission status
- Track student enrollments (coming soon)

### For Verifiers
- **/verifier** - Review pending courses
- Approve or reject with feedback
- Monitor published content

### Universal
- **/welcome** - Interactive onboarding
- **/ai-assistant** - Islamic Q&A chatbot
- **/settings** - Account preferences

## 🔒 Security Features

- ✅ Role-based access control
- ✅ Server-side verification
- ✅ Course approval workflow
- ✅ Content moderation system
- ✅ Feedback mechanism for rejections
- 🔄 Payment processing (ready to add)
- 🔄 Email notifications (templates ready)

## 📊 Database Schema

Complete TypeScript types in `src/lib/database-types.ts`:
- Users (with roles)
- Courses (with verification status)
- Enrollments
- Lessons
- Reflections
- Teaching Sessions
- Dhikr Entries
- Khatm Circles
- Achievements

## 🎨 Design System

- **Primary Color**: Saturated Teal (#008080)
- **Background**: Light Teal (#E0F8F8)
- **Accent**: Steel Blue (#4682B4)
- **Font**: PT Sans
- **Components**: shadcn/ui + Tailwind CSS

## 📝 Environment Variables Needed

Create `.env.local`:
```env
# Database
DATABASE_URL="your-connection-string"

# API Endpoints (optional)
NEXT_PUBLIC_LIBRARY_API="/api/library"

# Auth (when implementing NextAuth)
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-secret-key"

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."

# Payment (for specialized courses)
STRIPE_SECRET_KEY="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
```

## 🧪 Testing Role-Based Features

### Test as Student
Access: Dashboard, Library (enroll), Profile, Dhikr

### Test as Teacher
Access: Everything above + Teacher Portal (submit courses)

### Test as Verifier
Access: Everything above + Verifier Dashboard (approve/reject)

### Test as Admin
Access: Full system access

## 📦 Dependencies

Core:
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components

Optional (to add):
- firebase / @supabase/supabase-js (database)
- next-auth (authentication)
- @tanstack/react-query (data fetching)
- stripe (payments)
- nodemailer (emails)

## 🤝 Contributing

1. Implement database connection
2. Add authentication system
3. Create email notification system
4. Integrate payment for specialized courses
5. Add video upload/streaming
6. Implement live 1:1 teaching sessions
7. Build mobile app (React Native)

## 📚 Additional Resources

- [Database Setup Guide](DATABASE_SETUP.md)
- [TypeScript Types](src/lib/database-types.ts)
- [API Documentation](src/app/api/)

## 🔐 Admin Setup

To set up initial admin/verifier:
1. Create user account
2. Manually update user role in database
3. Or use admin seeding script

## 📧 Support

For implementation help:
- Check [DATABASE_SETUP.md](DATABASE_SETUP.md)
- Review API route comments
- See TypeScript types for data structures

---

**Built with ❤️ for the Muslim Ummah**

*May Allah accept our efforts and make this platform beneficial for all who seek Islamic knowledge.*
