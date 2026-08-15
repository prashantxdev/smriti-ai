import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Grid,
  Images,
  List,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Edit2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import { RequireAccess, useAccess } from "@/lib/access";
import { PageHeader } from "@/components/app/PageHeader";
import { MemoryModal, type MemoryItem } from "@/components/app/MemoryModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/memories")({
  head: () => ({
    meta: [
      { title: "Memories — Smriti AI" },
      { name: "description", content: "Every moment you save, searchable by the way you remember it." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MemoriesPage,
});

function MemoriesPage() {
  return (
    <RequireAccess area="memories">
      <MemoriesContent />
    </RequireAccess>
  );
}

function MemoriesContent() {
  const access = useAccess();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [importanceFilter, setImportanceFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [detailMemory, setDetailMemory] = useState<MemoryItem | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

  const memoriesQuery = useQuery<MemoryItem[]>({
    queryKey: ["memories", "list"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as MemoryItem[];
    },
  });

  const canAdd = access.data?.canPermission("ADD_MEMORIES") ?? true;
  const canEdit = access.data?.canPermission("EDIT_MEMORIES") ?? true;
  const canDelete = access.data?.canPermission("DELETE_MEMORIES") ?? true;

  const memories = (memoriesQuery.data ?? []).filter((mem) => {
    if (typeFilter !== "all" && mem.memory_type !== typeFilter) return false;
    if (importanceFilter !== "all" && mem.importance !== importanceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = mem.title.toLowerCase().includes(q);
      const descMatch = (mem.description || "").toLowerCase().includes(q);
      const locMatch = (mem.location || "").toLowerCase().includes(q);
      const tagMatch = (mem.tags || []).some((t) => t.toLowerCase().includes(q));
      return titleMatch || descMatch || locMatch || tagMatch;
    }
    return true;
  });

  function openCreate() {
    if (!canAdd) {
      toast.error("You do not have permission to add memories.");
      return;
    }
    setSelectedMemory(null);
    setModalOpen(true);
  }

  function openEdit(mem: MemoryItem) {
    if (!canEdit) {
      toast.error("You do not have permission to edit memories.");
      return;
    }
    setSelectedMemory(mem);
    setModalOpen(true);
  }

  async function handleDelete(mem: MemoryItem) {
    if (!canDelete) {
      toast.error("You do not have permission to delete memories.");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${mem.title}"?`)) return;

    setDeleteBusyId(mem.id);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const actorId = userData.user?.id || mem.owner_id;

      const { error } = await supabase.from("memories").delete().eq("id", mem.id);
      if (error) throw error;

      await logActivity({
        actorId,
        patientId: mem.owner_id,
        action: "memory_deleted",
        resourceType: "memory",
        resourceId: mem.id,
        metadata: { title: mem.title },
      });

      toast.success("Memory deleted.");
      await queryClient.invalidateQueries({ queryKey: ["memories"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete memory.");
    } finally {
      setDeleteBusyId(null);
    }
  }

  function refreshData() {
    void queryClient.invalidateQueries({ queryKey: ["memories"] });
  }

  return (
    <div>
      <PageHeader
        title="Memories"
        description="Every moment you save, searchable by the way you remember it."
        action={
          canAdd && (
            <Button onClick={openCreate} className="rounded-full gap-2">
              <Plus className="size-4" />
              Add Memory
            </Button>
          )
        }
      />

      {/* Filter & View controls */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search memories, locations, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 rounded-xl text-sm"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-36 rounded-xl text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="person">Person</SelectItem>
              <SelectItem value="place">Place</SelectItem>
              <SelectItem value="object">Object</SelectItem>
              <SelectItem value="information">Information</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={importanceFilter} onValueChange={setImportanceFilter}>
            <SelectTrigger className="h-10 w-36 rounded-xl text-xs">
              <SelectValue placeholder="All Importance" />
            </SelectTrigger>
            <SelectContent className="rounded-xl text-xs">
              <SelectItem value="all">All Importance</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 px-2.5 rounded-lg text-xs"
          >
            <Grid className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-2.5 rounded-lg text-xs"
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {memoriesQuery.isPending ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : memories.length === 0 ? (
        <div className="surface-card mt-8 flex flex-col items-center justify-center p-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Images className="size-7" />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold">Your memory library is empty</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Start by adding a person, place, or special moment you want Smriti AI to remember for you.
          </p>
          {canAdd && (
            <Button onClick={openCreate} className="mt-6 rounded-full gap-2">
              <Plus className="size-4" />
              Add Memory
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="surface-card group flex flex-col overflow-hidden transition-all hover:shadow-lift"
            >
              {mem.image_url ? (
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={mem.image_url}
                    alt={mem.title}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className="absolute right-3 top-3 rounded-full text-[0.65rem] capitalize">
                    {mem.memory_type}
                  </Badge>
                </div>
              ) : (
                <div className="relative flex aspect-[16/9] items-center justify-center bg-accent/40 text-muted-foreground">
                  <Images className="size-10 opacity-40" />
                  <Badge className="absolute right-3 top-3 rounded-full text-[0.65rem] capitalize">
                    {mem.memory_type}
                  </Badge>
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
                    {mem.title}
                  </h3>
                  <ImportanceBadge level={mem.importance} />
                </div>

                {mem.description && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {mem.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.7rem] text-muted-foreground">
                  {mem.event_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {format(new Date(mem.event_date), "MMM d, yyyy")}
                    </span>
                  )}
                  {mem.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {mem.location}
                    </span>
                  )}
                </div>

                {mem.tags && mem.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {mem.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailMemory(mem)}
                    className="h-8 rounded-lg text-xs gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="size-3.5" />
                    Details
                  </Button>

                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(mem)}
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleDelete(mem)}
                        disabled={deleteBusyId === mem.id}
                        className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="surface-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 transition-all hover:shadow-soft"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold">{mem.title}</h3>
                    <Badge variant="outline" className="text-[0.65rem] capitalize">
                      {mem.memory_type}
                    </Badge>
                    <ImportanceBadge level={mem.importance} />
                  </div>
                  {mem.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{mem.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-[0.7rem] text-muted-foreground">
                    {mem.event_date && <span>📅 {format(new Date(mem.event_date), "MMM d, yyyy")}</span>}
                    {mem.location && <span>📍 {mem.location}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailMemory(mem)}
                  className="rounded-xl text-xs gap-1"
                >
                  <Eye className="size-3.5" />
                  View
                </Button>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(mem)}
                    className="size-9 rounded-xl"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleDelete(mem)}
                    disabled={deleteBusyId === mem.id}
                    className="size-9 rounded-xl text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Edit/Create Modal */}
      <MemoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        memory={selectedMemory}
        onSuccess={refreshData}
      />

      {/* Detail Dialog */}
      <Dialog open={Boolean(detailMemory)} onOpenChange={(open) => !open && setDetailMemory(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{detailMemory?.title}</DialogTitle>
            <DialogDescription className="text-xs capitalize">
              {detailMemory?.memory_type} · Importance: {detailMemory?.importance}
            </DialogDescription>
          </DialogHeader>

          {detailMemory?.image_url && (
            <div className="mt-2 overflow-hidden rounded-xl bg-muted aspect-[16/9]">
              <img src={detailMemory.image_url} alt="" className="size-full object-cover" />
            </div>
          )}

          <div className="mt-4 space-y-3">
            {detailMemory?.description && (
              <p className="text-sm leading-relaxed text-foreground">{detailMemory.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border pt-3">
              {detailMemory?.event_date && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary" />
                  {format(new Date(detailMemory.event_date), "MMMM d, yyyy")}
                </div>
              )}
              {detailMemory?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary" />
                  {detailMemory.location}
                </div>
              )}
            </div>

            {detailMemory?.tags && detailMemory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {detailMemory.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="rounded-md text-xs">
                    #{t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ImportanceBadge({ level }: { level: string }) {
  if (level === "critical") {
    return (
      <Badge className="rounded-full bg-destructive/15 text-destructive border-0 text-[0.65rem] font-bold">
        Critical
      </Badge>
    );
  }
  if (level === "high") {
    return (
      <Badge className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 text-[0.65rem]">
        High
      </Badge>
    );
  }
  if (level === "medium") {
    return (
      <Badge variant="secondary" className="rounded-full text-[0.65rem]">
        Medium
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full text-muted-foreground text-[0.65rem]">
      Low
    </Badge>
  );
}
