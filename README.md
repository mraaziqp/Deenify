# 🌙 Deenify - Complete Islamic Learning Platform

A comprehensive platform for Islamic education featuring course management, verification workflow, teacher marketplace, and interactive learning tools.

## ✨ Key Features

### 🎓 Multi-Role System
- **Students**: Enroll in courses, track progress, earn achievements
- **Teachers**: Submit courses, offer teaching services, manage content
- **Verifiers**: Review and approve course submissions
- **Admins**: Full system oversight and management

### 📚 Course Management
- Free Islamic courses (Aqeedah, Fiqh, Hadith, Tajweed, etc.)
- Specialized/paid courses with verification workflow
- Category-based filtering and search
- Progress tracking and completion certificates
- Interactive lessons with quizzes

### ✅ Verification System
- Mandatory review before publication
- Quality control for Islamic content
- Detailed feedback mechanism
- Status tracking (pending/approved/rejected)
- Email notifications for status changes

### 🎯 Learning Tools
- **Dhikr Counter**: Global community dhikr tracker
- **Quran Khatm**: Coordinate Quran completion circles
- **Prayer Reminders**: Daily salah notifications
- **AI Assistant**: Islamic Q&A chatbot
- **Zakat Calculator**: Calculate your zakat accurately
- **Halal Screener**: Check stocks for shariah compliance
- **Wasiya Generator**: Create Islamic wills

### 📊 Progress Tracking
- Learning streak tracking
- Weekly activity visualization
- Achievement/badge system
- Course completion statistics
- Personalized learning dashboard

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/deenify.git
cd deenify

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

### Testing Different Roles

To test different user roles, edit `src/lib/auth-context.tsx` line 29:

```typescript
role: 'student',  // Change to: 'teacher', 'verifier', or 'admin'
```

The app will automatically show role-specific navigation and features.

**Tip:** Use the yellow Dev Role Switcher widget in the bottom-right corner for quick instructions!

## 📚 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Database Setup](DATABASE_SETUP.md)** - Connect Firebase/Supabase/Prisma
- **[Implementation Guide](IMPLEMENTATION_GUIDE.md)** - Feature overview
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Production deployment guide

## 🛠️ Tech Stack

### Core
- **Next.js 15** - App Router with Turbopack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library

### To Add (Production)
- **Firebase/Firestore** or **Supabase** - Database
- **NextAuth.js** - Authentication
- **Stripe** - Payment processing
- **SendGrid/Resend** - Email notifications

## 🚦 Next Steps to Production

1. **Choose Database** - See [DATABASE_SETUP.md](DATABASE_SETUP.md)
2. **Implement Authentication** - Install NextAuth.js
3. **Connect Database** - Update API routes
4. **Add Payments** - Integrate Stripe
5. **Deploy** - Push to Vercel

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for complete guide.

---

**May Allah accept this effort and make it beneficial for all who seek Islamic knowledge. Ameen.** 🤲
