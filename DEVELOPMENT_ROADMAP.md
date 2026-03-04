# Deenify — V10 Development Roadmap & Master Prompts
_Prepared: March 2026 | Based on marketing consultation + Gemini suggestions + codebase audit_

---

## 📊 Executive Summary

Your cousin's advice is solid. The monetisation model (ethical local-business ads → Hungry for Halaal partnership → premium tiers) is achievable and realistic for a community app in the Western Cape. Below is an **improved and grounded** plan vs. the Gemini output, because Gemini hadn't seen your actual code. Key differences are noted inline.

---

## 🗺️ Three-Phase Roadmap

### Phase 1 — Fix the UX (Anti-Scroll Dashboard + Ad Engine)
_Estimated effort: 1–2 days_

### Phase 2 — Dynamic Content Hub (News RSS + YouTube Video Library)
_Estimated effort: 1 day_

### Phase 3 — Monetisation Infrastructure (Admin Ad Manager + Analytics)
_Estimated effort: 1 day_

---

## 🔍 Codebase Audit Notes (Why This Plan Differs from Gemini)

The Gemini prompts were written blind. Here is what actually exists:

| What Gemini Said To Build | Reality in Your Code |
|---|---|
| "Convert features into horizontal scrollable row" | ✅ Already done — the 8-tile grid is at `dashboard/page.tsx:L168`. We keep it, not rebuild it. |
| "Consolidate Daily Ayah, Wisdom, Prayer Times into tabs" | ✅ Partial — tabs already exist (`selectedTab` state). We expand them to absorb the lower cards. |
| "Keep the As-salamu alaykum greeting" | ✅ Already the hero banner. We inject the ad carousel BELOW the hero. |
| "Build RSS fetcher" | ⚠️ New work — no news feature exists yet. |
| "Add VideoPlaylist model to Neon DB" | ⚠️ New work — Library exists but has no YouTube section. |
| "Run the migration" | ⚠️ Must use `prisma db push` not `prisma migrate` (matches your existing workflow). |

**The real dashboard problem:** The page has 8 stacked sections below the quick-tiles. The fix is to collapse sections 4–8 (Progress, Hadith, Prayer, Tasbeeh, Activity, Features, Duas) into the existing tab system — not rebuild the top.

---

## Phase 1 — Master Prompt A (Paste into GitHub Copilot / Cursor)

```
# 🚀 DEENIFY V10 — ANTI-SCROLL DASHBOARD + ETHICAL AD ENGINE

## Role
You are a senior Next.js 15 engineer working on the Deenify app (Islamic community PWA).
Stack: Next.js 15 App Router, TypeScript, Neon PostgreSQL, Prisma ORM, Tailwind CSS, shadcn/ui.
Working file: `src/app/(main)/dashboard/page.tsx` (489 lines — already read).

## Context
The dashboard currently has ~8 stacked sections below the quick-action tiles, making 
mobile users scroll excessively. The existing code already has:
- A beautiful Islamic hero banner at the top (keep as-is)
- A horizontal 8-tile icon grid (keep as-is)  
- A tab system with `selectedTab` state (EXPAND this — don't rebuild)

## Goal: Collapse the bottom 6 sections into 3 tabs + inject 1 ad carousel slot

---

## STEP 1: Prisma Schema — SponsoredBanner Model

Add to `prisma/schema.prisma`:

model SponsoredBanner {
  id           String   @id @default(cuid())
  businessName String
  imageUrl     String
  targetUrl    String?
  isActive     Boolean  @default(true)
  views        Int      @default(0)
  clicks       Int      @default(0)
  createdAt    DateTime @default(now())
}

Then run: `npx prisma db push`

---

## STEP 2: API Route for Banners

Create `src/app/api/banners/route.ts`:
- GET: Return all active banners (isActive: true). No auth required (public).
- POST: Create a new banner. Require admin role (check JWT cookie, hasRole admin).
- PATCH `?id=xxx`: Increment `views` or `clicks` counter atomically using prisma.$executeRaw
  or `prisma.sponsoredBanner.update({ where: { id }, data: { views: { increment: 1 } } })`.

---

## STEP 3: Sponsored Banner Carousel Component

Create `src/components/sponsored-banner-carousel.tsx`:
- 'use client' component
- Fetch banners from `/api/banners` on mount, also call the views increment API
- Display as a horizontal auto-rotating carousel (use CSS animation or setInterval every 4s)
- Each slide: full-width rounded card showing the businessName and image
- Bottom-right corner: tiny grey badge "Sponsored" (NOT "Ad" — more native feeling)
- On click: open targetUrl in new tab + fire a click increment to `/api/banners?id=xxx&action=click`
- If no banners: render nothing (null) — don't show an empty space
- Show max 3 slides. If 0 active banners, component returns null silently.

---

## STEP 4: Dashboard Refactor — Collapse Bottom Sections into Tabs

In `src/app/(main)/dashboard/page.tsx`, make these SURGICAL changes only:

### 4a. Add the ad carousel
Directly BELOW the 8-tile grid and ABOVE the tab system, insert:
```tsx
<SponsoredBannerCarousel />
```

### 4b. Expand the tab bar
Change `selectedTab` type from:
  `'learning' | 'yaseen' | 'qiblah' | 'ccemag' | 'fact' | 'admin'`
To:
  `'learning' | 'yaseen' | 'qiblah' | 'ccemag' | 'daily' | 'worship' | 'fact' | 'admin'`

Add two new tab buttons:
- "Daily" tab (📅 icon) — will contain Daily Hadith + Prayer Times
- "Worship" tab (📿 icon) — will contain Tasbeeh Counter

### 4c. Move bottom cards INTO the new tabs

**'daily' tab content:**
Remove `<DailyHadithCard />` and `<PrayerTimesCard />` from their current position 
in the grid below. Instead render them inside the 'daily' tab content:
```tsx
{selectedTab === 'daily' && (
  <div className="grid gap-4 md:grid-cols-2">
    <DailyHadithCard />
    <PrayerTimesCard />
  </div>
)}
```

**'worship' tab content:**
Remove the standalone Tasbeeh Counter card from below and render it here:
```tsx
{selectedTab === 'worship' && (
  <Card className="shadow-md">
    <CardHeader><CardTitle>Tasbeeh Counter</CardTitle></CardHeader>
    <CardContent><TasbeehCounter /></CardContent>
  </Card>
)}
```

### 4d. Remove the now-redundant bottom sections
DELETE from the JSX:
- The standalone `<DailyHadithCard />` + `<PrayerTimesCard />` grid
- The standalone Tasbeeh Counter Card
- The "Recent Activity" Card (activity is always empty — this is dead weight)
- The "Islamic Tools & Features" grid (these are already covered by the 8-tile icon grid)
- The "Hisnul Muslim Duas" card at the bottom (users have the Duas icon tile)

**RESULT:** Dashboard goes from ~8 scroll sections to ~3 scroll sections:
1. Hero Banner
2. 8-tile Quick Access Grid
3. Sponsored Banner Carousel (conditionally shown)
4. Tab System (tabs switch content in-place, no new scroll)

---

## STEP 5: Make the tab bar horizontally scrollable on mobile

The current tab row uses `flex gap-2`. Wrap it with:
```tsx
<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
  {/* tab buttons */}
</div>
```
Add `scrollbar-hide` utility to tailwind.config.ts if not present:
In the `theme.extend` section, add nothing — instead use the @tailwindcss/scrollbar-hide plugin
or just add `.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }` 
and `.scrollbar-hide::-webkit-scrollbar { display: none; }` to `globals.css`.

---

## Deliverables Expected
1. `prisma/schema.prisma` — SponsoredBanner model added
2. `src/app/api/banners/route.ts` — GET/POST/PATCH
3. `src/components/sponsored-banner-carousel.tsx` — carousel component
4. `src/app/(main)/dashboard/page.tsx` — surgical refactor (no full rewrite)

After completing, run `npx tsc --noEmit` and fix any type errors in the new files only.
Then run `git add -A && git commit -m "feat: anti-scroll dashboard + ethical ad banner engine"`.
```

---

## Phase 2 — Master Prompt B (RSS + YouTube)

```
# 🚀 DEENIFY V10.5 — DYNAMIC CONTENT HUB (RSS NEWS + YOUTUBE LIBRARY)

## Role
Senior Next.js 15 / TypeScript engineer. Same stack as before.

## PART 1: Islamic News Feed (/news)

### Install
Run: npm i rss-parser
Run: npm i --save-dev @types/rss-parser  (if types not bundled)

### Server Component Route Handler
Create `src/app/api/news/route.ts`:
- Import rss-parser
- Parse these two feeds (in parallel with Promise.allSettled — never crash if one is down):
  - https://muslimvillage.com/feed
  - https://muslimmatters.org/feed
- Map each item to: { title, link, pubDate, source, imageUrl (from content:encoded if available) }
- Combine, sort by pubDate descending, return top 20 items as JSON
- Add `export const revalidate = 3600;` (ISR — refresh every hour, not every request)
- Wrap everything in try/catch, return empty array [] on error — NEVER 500 the page

### News Page
Create `src/app/(main)/news/page.tsx`:
- 'use client' — fetch from /api/news on mount
- Loading state: show 5 skeleton cards (use the LoadingSkeleton components already in 
  `src/components/loading-skeletons.tsx`)
- Each article card: rounded-2xl, image (with fallback placeholder), title, source badge, 
  date, "Read More →" link (opens in new tab)
- At top: heading "Community News" with a small "Updates hourly" badge
- If empty/error: show a friendly "News unavailable — check back soon" message

### Add to Navigation
In `src/components/layout/sidebar.tsx` and `src/components/layout/header.tsx`:
Add: `{ href: '/news', label: 'News', icon: Newspaper }` (import Newspaper from lucide-react)
Position: after 'My Groups' in the nav list.

Also add '/news' to the middleware PUBLIC_PREFIXES or ensure it's covered under auth 
(it should require login like everything else — just add it as a protected route, no changes needed).

---

## PART 2: Video Library (/learn)

### Prisma Schema
Add to `prisma/schema.prisma`:

model VideoPlaylist {
  id               String   @id @default(cuid())
  title            String
  instructor       String
  youtubePlaylistId String
  thumbnailUrl     String
  category         String   @default("General")
  isActive         Boolean  @default(true)
  sortOrder        Int      @default(0)
  createdAt        DateTime @default(now())
}

Run: `npx prisma db push`

### Seed Data API (Admin only)
Create `src/app/api/video-playlists/route.ts`:
- GET: Return all active playlists ordered by sortOrder, no auth needed
- POST: Admin only — create a playlist entry

### Lite YouTube Embed Component  
Create `src/components/lite-youtube-embed.tsx`:
- 'use client'
- Props: `{ playlistId: string; title: string; thumbnailUrl: string }`
- Default state: shows thumbnail image + a centered ▶ play button overlay
- On click: replace the image with an iframe pointing to:
  `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1`
- Style: rounded-2xl, aspect-ratio 16/9, overflow-hidden
- This avoids loading heavy YouTube scripts until the user actually wants to watch

### Video Library Page
Create `src/app/(main)/learn/page.tsx`:
- Fetch playlists from `/api/video-playlists`
- Group by `category` (use lodash groupBy or a simple reduce)
- For each category: render a section heading + horizontal scrollable row of video cards
- Each card: LiteYoutubeEmbed + below it: playlist title, instructor name
- At top: "📺 Video Library" heading + "Curated Islamic content" subheading
- Empty state: "No playlists available yet — check back soon"

### Add to Navigation
Add `{ href: '/learn', label: 'Learn', icon: PlayCircle }` to sidebar + header nav
(import PlayCircle from lucide-react), position after 'News'.

### Seed 3 Starter Playlists
Create `scripts/seed-playlists.ts`:
Seed these playlists using prisma.videoPlaylist.upsert (idempotent):
1. title: "Stories of the Prophets", instructor: "Various Scholars", 
   youtubePlaylistId: "PLmHtBpgoVdqU0VoO2yUhYLqpYzGtJBM3D", // Example - use real one
   category: "History", thumbnailUrl: "https://img.youtube.com/vi/[FIRST_VIDEO_ID]/mqdefault.jpg"
2. title: "Fiqh Basics", instructor: "Mufti Menk",
   youtubePlaylistId: "PLmHtBpgoVdqU0VoO2yUhYLqpYzGtJBM3D", // Replace with real ID
   category: "Fiqh"
3. title: "Quran Tafseer — Al-Fatiha to Al-Baqarah", instructor: "Nouman Ali Khan",
   category: "Tafseer"

**NOTE TO DEVELOPER:** Replace the placeholder YouTube playlist IDs with real ones before 
running the seed. You can find Islamic playlists on YouTube and copy the list= param from 
the URL.

Run with: `npx ts-node --project tsconfig.json scripts/seed-playlists.ts`

---

## Deliverables Expected
1. `src/app/api/news/route.ts` — RSS fetcher with ISR
2. `src/app/(main)/news/page.tsx` — news feed UI
3. `prisma/schema.prisma` — VideoPlaylist model
4. `src/app/api/video-playlists/route.ts` — CRUD
5. `src/components/lite-youtube-embed.tsx` — lazy iframe component
6. `src/app/(main)/learn/page.tsx` — video library UI
7. `scripts/seed-playlists.ts` — starter data
8. Sidebar + header nav updated with News and Learn links

After completing: `npx tsc --noEmit` on new files, then commit:
`git add -A && git commit -m "feat: news RSS feed + video library"`
```

---

## Phase 3 — Master Prompt C (Monetisation Admin Panel)

```
# 🚀 DEENIFY V10 — MONETISATION ADMIN: AD MANAGER + ANALYTICS DASHBOARD

## Role
Senior Next.js 15 engineer. Admin panel work only.

## Context
SponsoredBanner model and API (from Phase 1) are already built.
The admin panel lives at `src/app/(main)/admin/page.tsx`.
The existing admin check: `hasRole('admin')` from `useAuth()`.

## Goal: Build the Ad Manager tab inside the existing admin page

### STEP 1: Admin UI Tab — Banner Manager

In `src/app/(main)/admin/page.tsx`, add a new tab called "Ad Manager":
- List all SponsoredBanners (fetch from GET /api/banners — no isActive filter for admin)
- Each row shows: businessName, active toggle, views count, clicks count, CTR% = (clicks/views*100)
- "Add Banner" button opens a dialog:
  - Fields: Business Name (text), Image URL (text), Target URL (text, optional)
  - On submit: POST to /api/banners
- Toggle active/inactive: PATCH /api/banners with { id, isActive: !current }
- Delete button: DELETE /api/banners?id=xxx (add DELETE handler to the banners route)

### STEP 2: Upload-Friendly Image Field

For the Image URL field in the Add Banner dialog:
- Add a helper text: "Use an image link from your Cloudinary or Firebase Storage"
- Add a small "📋 Paste from clipboard" icon button next to the input
  (navigator.clipboard.readText() — request permission inline)
- This keeps it simple — no file upload complexity needed right now

### STEP 3: Simple Analytics Card

At the top of the Ad Manager tab, show a summary card:
- Total active banners
- Total views (sum of all banners)  
- Total clicks (sum of all banners)
- Average CTR%
Fetch these numbers from the same GET /api/banners endpoint (compute client-side from array).

### STEP 4: Pricing Helper Text (for your own reference)

Below the banner list, add a grey info box visible only to admin:
```tsx
<div className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 mt-4">
  💡 Pricing guide: R200/month per banner slot · First 3 months free for launch partners · 
  Contact: your@email.com
</div>
```
Replace with your actual contact. This reminds you of the pricing model when you log in.

### STEP 5: API DELETE Handler

Update `src/app/api/banners/route.ts` to handle DELETE:
```typescript
export async function DELETE(req: Request) {
  // Verify admin role from cookie (same pattern as other admin routes)
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.sponsoredBanner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

---

## Deliverables Expected
1. Updated `src/app/(main)/admin/page.tsx` — new "Ad Manager" tab with full CRUD
2. Updated `src/app/api/banners/route.ts` — DELETE handler added
3. No new files needed — this all lives inside the existing admin structure

After completing: commit with `git add -A && git commit -m "feat: ad manager admin panel"`
```

---

## 💡 Improvements Over Gemini's Suggestions

| Gemini Said | Improved Approach |
|---|---|
| "Completely redesign dashboard" | Surgical edit — keep hero banner + icon grid (already great), only collapse bottom bloat |
| "Use Framer Motion for swipes" | Use pure CSS `overflow-x-auto snap-x` — no new dependency, faster load |
| "Run the migration" (ambiguous) | Specifically `npx prisma db push` — matches your existing workflow |
| "Fetch RSS on every request" | `export const revalidate = 3600` for ISR — cached for 1 hour, not refetched every page load |
| No error handling mentioned | `Promise.allSettled` for parallel RSS feeds — one broken feed doesn't crash the page |
| No admin panel for ads | Phase 3 adds full ad manager with CTR analytics + pricing reminder |
| No seeding strategy for videos | `scripts/seed-playlists.ts` with `upsert` — idempotent, safe to re-run |
| Generic YouTube embed | `LiteYoutubeEmbed` component — thumbnail first, iframe only on click — critical for performance on mobile data |

---

## 📅 Suggested Execution Order

```
Week 1:
  Day 1 morning  → Run Phase 1 Prompt A (dashboard + ads) — test on mobile
  Day 1 afternoon → Approach 2 local businesses, take banner images
  Day 2           → Run Phase 2 Prompt B (news + video library)
  Day 3           → Run Phase 3 Prompt C (admin panel for ads)

Week 2:
  → Upload first 2-3 real sponsor banners via admin panel
  → Share app link in: WhatsApp groups, local masjid newsletter
  → Target 50-100 users before pitching Hungry for Halaal

Month 2:
  → If 200+ users: email Hungry for Halaal API partnership pitch
  → Begin charging R200/month for banner slots (convert free launch partners)
```

---

## 🔌 Hungry for Halaal API Note

Their site is [hungryforhalaal.com](https://www.hungryforhalaal.com). There is no public API — email them directly:

**Email Template:**
> Subject: API Partnership Proposal — Deenify App
>
> Hi team, I run Deenify (deenify.co.za), a Muslim community app growing in Cape Town. 
> We have a Halal Food tab already in the app. Rather than building a competing directory, 
> we'd love to integrate your listings directly and drive traffic to your platform. 
> Would you be open to discussing an API or data-sharing arrangement?
>
> Current user base: [X users]. Happy to provide traffic analytics.

---

## 🚨 Important Technical Notes

1. **Never use Prisma Client in Client Components** — all DB calls go through API routes
2. **The `/news` page should be auth-protected** — it's inside `(main)` so the layout handles this
3. **YouTube playlist IDs**: Find them by opening any YouTube playlist → copy the `list=` value from the URL
4. **Banner images**: Tell businesses to send you a 1200×400px image. Upload to Cloudinary free tier → paste URL into admin panel
5. **Testing ads locally**: You'll need to add a test banner via the admin panel after Phase 3 is deployed

---

_End of Development Roadmap_
