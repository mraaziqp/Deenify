"use client";
import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function BookUploadForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coverUrl || !pdfUrl) {
      toast({ title: "Missing files", description: "Please upload both a cover image and PDF." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, category, coverImageUrl: coverUrl, pdfFileUrl: pdfUrl }),
      });
      if (res.ok) {
        toast({ title: "Book Published!", description: title });
        setTitle(""); setAuthor(""); setCategory(""); setCoverUrl(""); setPdfUrl("");
      } else {
        toast({ title: "Error", description: "Failed to save book." });
      }
    } catch (err) {
      toast({ title: "Upload failed", description: String(err) });
    }
    setLoading(false);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <Input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} required />
      <Input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
      <div>
        <label className="block font-semibold mb-1">Cover Image</label>
        <UploadButton<UploadRouter, "coverImage">
          endpoint="coverImage"
          onClientUploadComplete={(res) => setCoverUrl(res?.[0]?.url || "")}
          onUploadError={(err) => { toast({ title: "Upload failed", description: String(err) }); }}
        />
        {coverUrl && <div className="text-xs text-green-600">Uploaded!</div>}
      </div>
      <div>
        <label className="block font-semibold mb-1">PDF Document</label>
        <UploadButton<UploadRouter, "pdfFile">
          endpoint="pdfFile"
          onClientUploadComplete={(res) => setPdfUrl(res?.[0]?.url || "")}
          onUploadError={(err) => { toast({ title: "Upload failed", description: String(err) }); }}
        />
        {pdfUrl && <div className="text-xs text-green-600">Uploaded!</div>}
      </div>
      {loading && (
        <div className="h-2 bg-gray-200 rounded">
          <div className="h-2 bg-blue-500 rounded animate-pulse w-1/2" />
        </div>
      )}
      <Button type="submit" disabled={loading}>{loading ? "Uploading..." : "Publish Book"}</Button>
    </form>
  );
}
