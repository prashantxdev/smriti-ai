import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Edit2, MapPin, Plus, Search, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/_authenticated/places")({
  head: () => ({
    meta: [
      { title: "Places — Smriti AI" },
      { name: "description", content: "Important locations and places you visit regularly." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlacesPage,
});

type PlaceItem = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string | null;
  image_url: string | null;
  is_demo?: boolean;
};

function PlacesPage() {
  return (
    <RequireAccess area="places">
      <PlacesContent />
    </RequireAccess>
  );
}

function PlacesContent() {
  const access = useAccess();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceItem | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const placesQuery = useQuery<PlaceItem[]>({
    queryKey: ["places", "list"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as PlaceItem[];
    },
  });

  const canAdd = access.data?.canPermission("ADD_MEMORIES") ?? true;
  const canEdit = access.data?.canPermission("EDIT_MEMORIES") ?? true;
  const canDelete = access.data?.canPermission("DELETE_MEMORIES") ?? true;

  const places = (placesQuery.data ?? []).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.address || "").toLowerCase().includes(q)
    );
  });

  function openCreate() {
    setEditingPlace(null);
    setName("");
    setDescription("");
    setAddress("");
    setImageUrl("");
    setModalOpen(true);
  }

  function openEdit(p: PlaceItem) {
    setEditingPlace(p);
    setName(p.name);
    setDescription(p.description || "");
    setAddress(p.address || "");
    setImageUrl(p.image_url || "");
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
        address: address.trim() || null,
        image_url: imageUrl.trim() || null,
        owner_id: editingPlace?.owner_id || userId,
      };

      if (editingPlace) {
        const { error } = await supabase.from("places").update(payload).eq("id", editingPlace.id);
        if (error) throw error;
        toast.success("Place updated.");
      } else {
        const { error } = await supabase.from("places").insert(payload);
        if (error) throw error;
        toast.success("Place added.");
      }

      setModalOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["places"] });
    } catch (err) {
      toast.error("Failed to save place.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(p: PlaceItem) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      const { error } = await supabase.from("places").delete().eq("id", p.id);
      if (error) throw error;
      toast.success("Place deleted.");
      void queryClient.invalidateQueries({ queryKey: ["places"] });
    } catch (err) {
      toast.error("Failed to delete place.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Places"
        description="Important locations you visit, with addresses and familiar details."
        action={
          canAdd && (
            <Button onClick={openCreate} className="rounded-full gap-2">
              <Plus className="size-4" />
              Add Place
            </Button>
          )
        }
      />

      <div className="mt-8 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 rounded-xl text-sm"
          />
        </div>
      </div>

      {placesQuery.isPending ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : places.length === 0 ? (
        <div className="surface-card mt-8 flex flex-col items-center justify-center p-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MapPin className="size-7" />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold">No places saved yet</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Save your home, regular doctor office, park, or temple.
          </p>
          {canAdd && (
            <Button onClick={openCreate} className="mt-6 rounded-full gap-2">
              <Plus className="size-4" />
              Add Place
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <div key={p.id} className="surface-card flex flex-col justify-between p-5 transition-all hover:shadow-lift">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                </div>

                {p.description && <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{p.description}</p>}
                {p.address && <p className="mt-2 text-xs font-medium text-foreground">📍 {p.address}</p>}
              </div>

              <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/60 pt-3">
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="size-8 rounded-lg">
                    <Edit2 className="size-3.5" />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="icon" onClick={() => void handleDelete(p)} className="size-8 rounded-lg text-destructive">
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
            <DialogTitle className="font-display text-xl">{editingPlace ? "Edit Place" : "Add a Place"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Name *</Label>
              <Input required placeholder="Home, Park, Hospital" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Address</Label>
              <Input placeholder="12 Ashok Lane" value={address} onChange={(e) => setAddress(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Description</Label>
              <Textarea rows={2} placeholder="Where you live, with the blue door." value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl resize-none text-sm" />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={busy} className="rounded-xl">Save Place</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
