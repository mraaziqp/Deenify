"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Trash2, Pencil, Plus, ExternalLink, Check, X } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  category?: string;
  description?: string;
  pdfFileUrl: string;
  coverImageUrl?: string;
}

export function ContentManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Book>>({});
  const [newBook, setNewBook] = useState({ title: "", author: "", category: "", description: "", pdfFileUrl: "", coverImageUrl: "" });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  async function fetchBooks() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pdf-book-list");
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load books.");
    }
    setLoading(false);
  }

  useEffect(() => { fetchBooks(); }, []);

  const startEdit = (book: Book) => {
    setEditingId(book.id);
    setEditData({ ...book });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/pdf-book?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Book updated!" });
      setEditingId(null);
      await fetchBooks();
    } catch {
      toast({ title: "Error", description: "Failed to update book.", variant: "destructive" });
    }
  };

  const deleteBook = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    try {
      const res = await fetch(`/api/pdf-book?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Book deleted" });
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast({ title: "Error", description: "Failed to delete book.", variant: "destructive" });
    }
  };

  const addBook = async () => {
    if (!newBook.title || !newBook.pdfFileUrl) {
      toast({ title: "Missing fields", description: "Title and PDF URL are required." });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Book added!", description: newBook.title });
      setNewBook({ title: "", author: "", category: "", description: "", pdfFileUrl: "", coverImageUrl: "" });
      setShowAdd(false);
      await fetchBooks();
    } catch {
      toast({ title: "Error", description: "Failed to add book.", variant: "destructive" });
    }
    setAdding(false);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Book &amp; PDF Content Manager
            </CardTitle>
            <CardDescription>
              Add, edit, or delete Islamic books and PDFs. You can paste any direct PDF link or change existing ones.
            </CardDescription>
          </div>
          <Button onClick={() => setShowAdd((p) => !p)} variant={showAdd ? "secondary" : "default"} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {showAdd ? "Cancel" : "Add Book"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-destructive text-sm">{error}</p>}

        {/* Add book form */}
        {showAdd && (
          <Card className="border-dashed border-primary/40 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">New Book / PDF</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Title *" value={newBook.title} onChange={(e) => setNewBook((p) => ({ ...p, title: e.target.value }))} />
              <Input placeholder="Author" value={newBook.author} onChange={(e) => setNewBook((p) => ({ ...p, author: e.target.value }))} />
              <Input placeholder="Category (e.g. Tafsir, Hadith)" value={newBook.category} onChange={(e) => setNewBook((p) => ({ ...p, category: e.target.value }))} />
              <Input placeholder="Description" value={newBook.description} onChange={(e) => setNewBook((p) => ({ ...p, description: e.target.value }))} />
              <Input
                placeholder="PDF File URL * (paste direct link)"
                value={newBook.pdfFileUrl}
                onChange={(e) => setNewBook((p) => ({ ...p, pdfFileUrl: e.target.value }))}
              />
              <Input
                placeholder="Cover Image URL (optional)"
                value={newBook.coverImageUrl}
                onChange={(e) => setNewBook((p) => ({ ...p, coverImageUrl: e.target.value }))}
              />
              <Button onClick={addBook} disabled={adding} className="w-full">
                {adding ? "Adding…" : "Add Book"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Book list */}
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading books…</p>
        ) : books.length === 0 ? (
          <p className="text-muted-foreground text-sm">No books found. Add your first book above.</p>
        ) : (
          <div className="space-y-3">
            {books.map((book) =>
              editingId === book.id ? (
                <div key={book.id} className="border rounded-lg p-4 bg-muted/30 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Editing: {book.title}</p>
                  <Input value={editData.title ?? ""} onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))} placeholder="Title" />
                  <Input value={editData.author ?? ""} onChange={(e) => setEditData((p) => ({ ...p, author: e.target.value }))} placeholder="Author" />
                  <Input value={editData.category ?? ""} onChange={(e) => setEditData((p) => ({ ...p, category: e.target.value }))} placeholder="Category" />
                  <Input value={editData.description ?? ""} onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))} placeholder="Description" />
                  <Input value={editData.pdfFileUrl ?? ""} onChange={(e) => setEditData((p) => ({ ...p, pdfFileUrl: e.target.value }))} placeholder="PDF URL" />
                  <Input value={editData.coverImageUrl ?? ""} onChange={(e) => setEditData((p) => ({ ...p, coverImageUrl: e.target.value }))} placeholder="Cover Image URL" />
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => saveEdit(book.id)}>
                      <Check className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      <X className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div key={book.id} className="border rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{book.title}</div>
                    <div className="text-xs text-muted-foreground">{book.author}</div>
                    {book.category && <Badge variant="secondary" className="mt-1 text-xs">{book.category}</Badge>}
                    <div className="text-xs text-muted-foreground mt-1 truncate">{book.pdfFileUrl}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <a href={book.pdfFileUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="ghost" title="Open PDF">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(book)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => deleteBook(book.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
