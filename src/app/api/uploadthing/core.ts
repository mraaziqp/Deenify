import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const uploadRouter = {
  coverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
  pdfFile: f({ pdf: { maxFileSize: "32MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
  dishImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
