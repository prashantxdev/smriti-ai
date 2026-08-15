import { useEffect, useState } from "react";
import { Calendar, Heart, Image as ImageIcon, Info, Loader2, Tag, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";

export type PersonItem = {
  id: string;
  owner_id: string;
  name: string;
  relationship: string | null;
  description: string | null;
  important_info: string | null;
  tags: string[];
  image_url: string | null;
  last_interaction: string | null;
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
};

export function PersonModal({
  open,
  onOpenChange,
  person,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: PersonItem | null;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [description, setDescription] = useState("");
  const [importantInfo, setImportantInfo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [lastInteraction, setLastInteraction] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [busy, setBusy] = useState(false);

  const isEditing = Boolean(person?.id);

  useEffect(() => {
    if (person) {
      setName(person.name || "");
      setRelationship(person.relationship || "");
      setDescription(person.description || "");
      setImportantInfo(person.important_info || "");
      setImageUrl(person.image_url || "");
      setLastInteraction(person.last_interaction ? (person.last_interaction.split("T")[0] ?? "") : "");
      setTagsInput((person.tags || []).join(", "));
    } else {
      setName("");
      setRelationship("");
      setDescription("");
      setImportantInfo("");
      setImageUrl("");
      setLastInteraction(new Date().toISOString().split("T")[0] ?? "");
      setTagsInput("");
    }
  }, [person, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Person's name is required.");
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
        name: name.trim(),
        relationship: relationship.trim() || null,
        description: description.trim() || null,
        important_info: importantInfo.trim() || null,
        image_url: imageUrl.trim() || null,
        last_interaction: lastInteraction || null,
        tags,
        owner_id: person?.owner_id || userId,
      };

      if (isEditing && person) {
        const { error } = await supabase.from("people").update(payload).eq("id", person.id);
        if (error) throw error;

        await logActivity({
          actorId: userId,
          patientId: person.owner_id,
          action: "person_updated",
          resourceType: "person",
          resourceId: person.id,
          metadata: { name: payload.name },
        });

        toast.success("Person updated successfully.");
      } else {
        const { data: newP, error } = await supabase.from("people").insert(payload).select().single();
        if (error) throw error;

        await logActivity({
          actorId: userId,
          patientId: userId,
          action: "person_created",
          resourceType: "person",
          resourceId: newP.id,
          metadata: { name: payload.name },
        });

        toast.success("Person added to your circle.");
      }

      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save person.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Person Profile" : "Add a Person"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update relationship details, notes, and photos for this person."
              : "Add someone important to your circle so Smriti AI can help you recognise them."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-name" className="text-xs font-semibold uppercase text-muted-foreground">
                Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="p-name"
                  required
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 pl-9 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-rel" className="text-xs font-semibold uppercase text-muted-foreground">
                Relationship
              </Label>
              <div className="relative">
                <Heart className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="p-rel"
                  placeholder="Son, Daughter, Friend"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="h-11 pl-9 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-desc" className="text-xs font-semibold uppercase text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="p-desc"
              rows={2}
              placeholder="e.g. Works in software engineering and lives nearby in the city."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl resize-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-info" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
              <Info className="size-3 text-primary" />
              Important Information to Remember
            </Label>
            <Textarea
              id="p-info"
              rows={2}
              placeholder="e.g. Calls every Sunday evening. Prefers black tea without sugar."
              value={importantInfo}
              onChange={(e) => setImportantInfo(e.target.value)}
              className="rounded-xl resize-none text-sm border-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-image" className="text-xs font-semibold uppercase text-muted-foreground">
                Photo URL
              </Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="p-image"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-11 pl-9 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-last" className="text-xs font-semibold uppercase text-muted-foreground">
                Last Interaction Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
                <Input
                  id="p-last"
                  type="date"
                  value={lastInteraction}
                  onChange={(e) => setLastInteraction(e.target.value)}
                  className="h-11 pl-9 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-tags" className="text-xs font-semibold uppercase text-muted-foreground">
              Tags (Comma separated)
            </Label>
            <div className="relative">
              <Tag className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <Input
                id="p-tags"
                placeholder="family, son, daily"
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
              {isEditing ? "Save Profile" : "Add Person"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
