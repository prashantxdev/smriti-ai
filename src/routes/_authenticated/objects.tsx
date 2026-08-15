import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Edit2, Package, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RequireAccess, useAccess } from "@/lib/access";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/objects")({
  head: () => ({
    meta: [
      { title: "Objects — Smriti AI" },
      { name: "description", content: "Important everyday objects and where you usually keep them." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ObjectsPage,
});

type ObjectItem = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  usual_location: string | null;
  image_url: string | null;
  is_demo?: boolean;
};

function ObjectsPage() {
  return (
    <RequireAccess area="objects">
      <ObjectsContent />
    </RequireAccess>
  );
}

function ObjectsContent() {
  const access = useAccess();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<ObjectItem | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [usualLocation, setUsualLocation] = useState("");
  const [busy, setBusy] = useState(false);

  const objectsQuery = useQuery<ObjectItem[]>({
    queryKey: ["objects", "list"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from("objects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ObjectItem[];
    },
  });

  const canAdd = access.data?.canPermission("ADD_MEMORIES") ?? true;
  const canEdit = access.data?.canPermission("EDIT_MEMORIES") ?? true;
  const canDelete = access.data?.canPermission("DELETE_MEMORIES") ?? true;

  const objects = (objectsQuery.data ?? []).filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      (o.description || "").toLowerCase().includes(q) ||
      (o.usual_location || "").toLowerCase().includes(q)
    );
  });

  function openCreate() {
    setEditingObj(null);
    setName("");
    setDescription("");
    setUsualLocation("");
    setModalOpen(true);
  }

  function openEdit(o: ObjectItem) {
    setEditingObj(o);
    setName(o.name);
    setDescription(o.description || "");
    setUsualLocation(o.usual_location || "");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        usual_location: usualLocation.trim() || null,
        owner_id: editingObj?.owner_id || userId,
      };

      if (editingObj) {
        const { error } = await supabase.from("objects").update(payload).eq("id", editingObj.id);
        if (error) throw error;
        toast.success("Object updated.");
      } else {
        const { error } = await supabase.from("objects").insert(payload);
        if (error) throw error;
        toast.success("Object saved.");
      }

      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["objects"] });
    } catch (err) {
      toast.error("Failed to save object.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(o: ObjectItem) {
    if (!confirm(`Delete "${o.name}"?`)) return;
    try {
      const { error } = await supabase.from("objects").delete().eq("id", o.id);
      if (error) throw error;
      toast.success("Object deleted.");
      void queryClient.invalidateQueries({ queryKey: ["objects"] });
    } catch (err) {
      toast.error("Failed to delete object.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Objects & Belongings"
        description="Everyday items (keys, glasses, medicine box, wallet) and where they are kept."
        action={
          canAdd && (
            <Button onClick={openCreate} className="rounded-full gap-2">
              <Plus className="size-4" />
              Add Object
            </Button>
          )
        }
      />

      <div className="mt-8 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search objects or usual locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 rounded-xl text-sm"
          />
        </div>
      </div>

      {objectsQuery.isPending ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : objects.length === 0 ? (
        <div className="surface-card mt-8 flex flex-col items-center justify-center p-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="size-7" />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold">No objects saved yet</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Keep track of where your house keys, wallet, or glasses are usually stored.
          </p>
          {canAdd && (
            <Button onClick={openCreate} className="mt-6 rounded-full gap-2">
              <Plus className="size-4" />
              Add Object
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {objects.map((o) => (
            <div key={o.id} className="surface-card flex flex-col justify-between p-5 transition-all hover:shadow-lift">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Package className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">{o.name}</h3>
                </div>

                {o.description && <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{o.description}</p>}
                {o.usual_location && (
                  <div className="mt-3 rounded-xl bg-muted p-2.5 text-xs text-foreground">
                    <span className="font-semibold text-muted-foreground block text-[0.65rem] uppercase">Usual Location</span>
                    {o.usual_location}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/60 pt-3">
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => openEdit(o)} className="size-8 rounded-lg">
                    <Edit2 className="size-3.5" />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="icon" onClick={() => void handleDelete(o)} className="size-8 rounded-lg text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editingObj ? "Edit Object" : "Add an Object"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Name *</Label>
              <Input required placeholder="House Keys, Wallet, Glasses" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Usual Location</Label>
              <Input placeholder="Bowl near front door, Bedside table" value={usualLocation} onChange={(e) => setUsualLocation(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Description</Label>
              <Textarea rows={2} placeholder="Brass keys on a red keyring." value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl resize-none text-sm" />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={busy} className="rounded-xl">Save Object</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
