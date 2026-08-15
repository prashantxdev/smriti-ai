import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Image as ImageIcon, Loader2, MapPin, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { logActivity } from "@/lib/activity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type MemoryType = Database["public"]["Enums"]["memory_type"];
type ImportanceLevel = Database["public"]["Enums"]["importance_level"];

export type MemoryItem = {
  id: string;
  owner_id: string;
  created_by?: string | null;
  title: string;
  description: string | null;
  memory_type: MemoryType;
  image_url: string | null;
  event_date: string | null;
  location: string | null;
  importance: ImportanceLevel;
  tags: string[];
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
};

export function MemoryModal({
  open,
  onOpenChange,
  memory,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memory?: MemoryItem | null;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memoryType, setMemoryType] = useState<MemoryType>("event");
  const [importance, setImportance] = useState<ImportanceLevel>("medium");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [busy, setBusy] = useState(false);

  const isEditing = Boolean(memory?.id);

  useEffect(() => {
    if (memory) {
      setTitle(memory.title || "");
      setDescription(memory.description || "");
      setMemoryType(memory.memory_type || "event");
      setImportance(memory.importance || "medium");
      setEventDate(memory.event_date ? (memory.event_date.split("T")[0] ?? "") : "");
      setLocation(memory.location || "");
      setImageUrl(memory.image_url || "");
      setTagsInput((memory.tags || []).join(", "));
    } else {
      setTitle("");
      setDescription("");
      setMemoryType("event");
      setImportance("medium");
      setEventDate(new Date().toISOString().split("T")[0] ?? "");
      setLocation("");
      setImageUrl("");
      setTagsInput("");
    }
  }, [memory, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Memory title is required.");
      return;
    }

    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        memory_type: memoryType,
        importance,
        event_date: eventDate || null,
        location: location.trim() || null,
        image_url: imageUrl.trim() || null,
        tags,
        owner_id: memory?.owner_id || userId,
      };

      if (isEditing && memory) {
        const { error } = await supabase
          .from("memories")
          .update(payload)
          .eq("id", memory.id);

        if (error) throw error;

        await logActivity({
          actorId: userId,
          patientId: memory.owner_id,
          action: "memory_updated",
          resourceType: "memory",
          resourceId: memory.id,
          metadata: { title: payload.title },
        });

        toast.success("Memory updated successfully.");
      } else {
        const { data: newMem, error } = await supabase
          .from("memories")
          .insert({
            ...payload,
            created_by: userId,
          })
          .select()
          .single();

        if (error) throw error;

        await logActivity({
          actorId: userId,
          patientId: userId,
          action: "memory_created",
          resourceType: "memory",
          resourceId: newMem.id,
          metadata: { title: payload.title },
        });

        toast.success("Memory saved successfully.");
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save memory.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Memory" : "Save a Memory"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update details about this moment in your memory library."
              : "Capture a moment, conversation, or important detail to remember."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mem-title" className="text-xs font-semibold uppercase text-muted-foreground">
              Title *
            </Label>
            <Input
              id="mem-title"
              required
              placeholder="e.g. Family Dinner at Home"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Category</Label>
              <Select value={memoryType} onValueChange={(v) => setMemoryType(v as MemoryType)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="event">Event / Moment</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="person">Person</SelectItem>
                  <SelectItem value="place">Place</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="information">Information</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Importance</Label>
              <Select value={importance} onValueChange={(v) => setImportance(v as ImportanceLevel)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical font-bold text-destructive">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mem-desc" className="text-xs font-semibold uppercase text-muted-foreground">
              Description & Details
            </Label>
            <Textarea
              id="mem-desc"
              rows={3}
              placeholder="What happened? Who was there? What was special about this day?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl resize-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mem-date" className="text-xs font-semibold uppercase text-muted-foreground">
                Date
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="mem-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-11 pl-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mem-location" className="text-xs font-semibold uppercase text-muted-foreground">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="mem-location"
                  placeholder="e.g. Home, Green Park"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 pl-9 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mem-image" className="text-xs font-semibold uppercase text-muted-foreground">
              Image URL (Optional)
            </Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                id="mem-image"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-11 pl-9 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mem-tags" className="text-xs font-semibold uppercase text-muted-foreground">
              Tags (Comma separated)
            </Label>
            <div className="relative">
              <Tag className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                id="mem-tags"
                placeholder="family, dinner, rahul, home"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="h-11 pl-9 rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="rounded-xl">
              {busy && <Loader2 className="size-4 animate-spin mr-2" />}
              {isEditing ? "Save Changes" : "Save Memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
