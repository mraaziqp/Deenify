"use client";
import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function RecipeUploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  function handleIngredientChange(idx: number, value: string) {
    setIngredients(ings => ings.map((ing, i) => i === idx ? value : ing));
  }
  function handleInstructionChange(idx: number, value: string) {
    setInstructions(ins => ins.map((step, i) => i === idx ? value : step));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      toast({ title: "Missing image", description: "Please upload a dish image." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          prepTime,
          imageUrl,
          ingredients,
          instructions,
        }),
      });
      if (res.ok) {
        toast({ title: "Recipe Published!", description: title });
        setTitle(""); setDescription(""); setPrepTime(""); setIngredients([""]); setInstructions([""]); 
      } else {
        toast({ title: "Error", description: "Failed to save recipe." });
      }
    } catch (err) {
      toast({ title: "Upload failed", description: String(err) });
    }
    setLoading(false);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
      <Input placeholder="Prep Time (e.g. 30 min)" value={prepTime} onChange={e => setPrepTime(e.target.value)} required />
      <div>
        <label className="block font-semibold mb-1">Dish Image</label>
        <UploadButton<UploadRouter, "dishImage">
          endpoint="dishImage"
          onClientUploadComplete={(res) => setImageUrl(res?.[0]?.url || "")}
          onUploadError={(err) => { toast({ title: "Upload failed", description: String(err) }); }}
        />
        {imageUrl && <div className="text-xs text-green-600">Uploaded!</div>}
      </div>
      <div>
        <label className="block font-semibold mb-1">Ingredients</label>
        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <Input value={ing} onChange={e => handleIngredientChange(i, e.target.value)} required />
            <Button type="button" onClick={() => setIngredients(ings => ings.length > 1 ? ings.filter((_, idx) => idx !== i) : ings)} disabled={ingredients.length === 1}>-</Button>
            {i === ingredients.length - 1 && <Button type="button" onClick={() => setIngredients([...ingredients, ""])}>+</Button>}
          </div>
        ))}
      </div>
      <div>
        <label className="block font-semibold mb-1">Instructions</label>
        {instructions.map((step, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <Input value={step} onChange={e => handleInstructionChange(i, e.target.value)} required />
            <Button type="button" onClick={() => setInstructions(ins => ins.length > 1 ? ins.filter((_, idx) => idx !== i) : ins)} disabled={instructions.length === 1}>-</Button>
            {i === instructions.length - 1 && <Button type="button" onClick={() => setInstructions([...instructions, ""])}>+</Button>}
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-200 rounded">
        {loading && (
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-2 bg-green-500 rounded animate-pulse w-1/2" />
          </div>
        )}
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Uploading..." : "Publish Recipe"}</Button>
    </form>
  );
}
