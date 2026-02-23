## ☁️ Cloud Upload Approach for Deenify

### Key Principle
Never send files through Server Actions or API routes. Use a client-side uploader (e.g., @vercel/blob/client or UploadThing) to upload directly to the cloud, then save the returned URL to Neon via a Server Action or API.

### Example Flow
1. User selects file(s) in the browser.
2. Use @vercel/blob/client or UploadThing to upload directly from the browser to the cloud bucket.
3. Receive a secure URL (e.g., `https://...vercel-storage.com/...pdf`).
4. Submit the metadata + URL to your Server Action (or API) to save in Neon.

#### Sample Client Upload (with @vercel/blob/client):

```tsx
import { upload } from "@vercel/blob/client";

async function handleUpload(file: File, setProgress: (n: number) => void) {
  const { url } = await upload(file.name, file, {
    access: "public", // or "private"
    onProgress: (progress) => setProgress(progress), // 0-100%
  });
  // Now send `url` + metadata to your server action or API
}
```

#### Server Action Example:

```ts
// Save to Neon DB (Book/Recipe table)
export async function saveBookToDb({ title, author, coverImageUrl, pdfFileUrl, category }) {
  // Use Prisma/Drizzle to insert into Neon
}
```

### Admin Security

- All `/admin` routes must check:  
  `if (currentUser.role !== 'admin') redirect('/')`
- Use your existing auth context or middleware for this check.