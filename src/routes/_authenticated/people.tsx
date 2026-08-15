import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Edit2,
  Heart,
  Info,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import { RequireAccess, useAccess } from "@/lib/access";
import { PageHeader } from "@/components/app/PageHeader";
import { PersonModal, type PersonItem } from "@/components/app/PersonModal";
import { MemoryModal } from "@/components/app/MemoryModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/people")({
  head: () => ({
    meta: [
      { title: "People — Smriti AI" },
      { name: "description", content: "The familiar faces in your circle, with relationships and shared moments." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PeoplePage,
});

function PeoplePage() {
  return (
    <RequireAccess area="people">
      <PeopleContent />
    </RequireAccess>
  );
}

function PeopleContent() {
  const access = useAccess();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonItem | null>(null);
  const [detailPerson, setDetailPerson] = useState<PersonItem | null>(null);

  const [addMemOpen, setAddMemOpen] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

  const peopleQuery = useQuery<PersonItem[]>({
    queryKey: ["people", "list"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from("people")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as PersonItem[];
    },
  });

  const canManage = access.data?.canPermission("MANAGE_PEOPLE") ?? true;

  const people = (peopleQuery.data ?? []).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = p.name.toLowerCase().includes(q);
    const relMatch = (p.relationship || "").toLowerCase().includes(q);
    const descMatch = (p.description || "").toLowerCase().includes(q);
    const tagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
    return nameMatch || relMatch || descMatch || tagMatch;
  });

  function openCreate() {
    if (!canManage) {
      toast.error("You do not have permission to add people.");
      return;
    }
    setSelectedPerson(null);
    setModalOpen(true);
  }

  function openEdit(p: PersonItem) {
    if (!canManage) {
      toast.error("You do not have permission to edit people.");
      return;
    }
    setSelectedPerson(p);
    setModalOpen(true);
  }

  async function handleDelete(p: PersonItem) {
    if (!canManage) {
      toast.error("You do not have permission to delete people.");
      return;
    }
    if (!confirm(`Are you sure you want to remove ${p.name} from your circle?`)) return;

    setDeleteBusyId(p.id);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const actorId = userData.user?.id || p.owner_id;

      const { error } = await supabase.from("people").delete().eq("id", p.id);
      if (error) throw error;

      await logActivity({
        actorId,
        patientId: p.owner_id,
        action: "person_deleted",
        resourceType: "person",
        resourceId: p.id,
        metadata: { name: p.name },
      });

      toast.success(`${p.name} removed.`);
      await queryClient.invalidateQueries({ queryKey: ["people"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete person.");
    } finally {
      setDeleteBusyId(null);
    }
  }

  function refreshData() {
    void queryClient.invalidateQueries({ queryKey: ["people"] });
  }

  return (
    <div>
      <PageHeader
        title="People"
        description="The familiar faces in your circle, with relationships, key notes and shared moments."
        action={
          canManage && (
            <Button onClick={openCreate} className="rounded-full gap-2">
              <UserPlus className="size-4" />
              Add Person
            </Button>
          )
        }
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, relationship, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 rounded-xl text-sm"
          />
        </div>
      </div>

      {peopleQuery.isPending ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : people.length === 0 ? (
        <div className="surface-card mt-8 flex flex-col items-center justify-center p-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-7" />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold">Add the people who matter to you</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Save family members, friends, doctors, and neighbors so Smriti AI can gently remind you who they are.
          </p>
          {canManage && (
            <Button onClick={openCreate} className="mt-6 rounded-full gap-2">
              <Plus className="size-4" />
              Add Person
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => {
            const initials = p.name.slice(0, 2).toUpperCase();
            return (
              <div
                key={p.id}
                className="surface-card group flex flex-col justify-between p-5 transition-all hover:shadow-lift"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <Avatar className="size-14 border-2 border-primary/20 shadow-soft">
                      <AvatarImage src={p.image_url || undefined} alt={p.name} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 font-display font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
                        {p.name}
                      </h3>
                      {p.relationship && (
                        <Badge variant="secondary" className="rounded-full text-[0.65rem] font-medium">
                          {p.relationship}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {p.description && (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {p.important_info && (
                    <div className="mt-3 rounded-xl bg-primary/5 p-2.5 text-xs text-foreground border border-primary/10 flex items-start gap-2">
                      <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{p.important_info}</p>
                    </div>
                  )}

                  {p.last_interaction && (
                    <p className="mt-3 text-[0.7rem] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      Last seen: {format(new Date(p.last_interaction), "MMM d, yyyy")}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailPerson(p)}
                    className="h-8 rounded-lg text-xs gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <UserCheck className="size-3.5" />
                    Profile
                  </Button>

                  <div className="flex items-center gap-1">
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                    )}
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleDelete(p)}
                        disabled={deleteBusyId === p.id}
                        className="size-8 rounded-lg text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Person Edit/Create Modal */}
      <PersonModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        person={selectedPerson}
        onSuccess={refreshData}
      />

      {/* Person Profile Detail Dialog */}
      <Dialog open={Boolean(detailPerson)} onOpenChange={(open) => !open && setDetailPerson(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-primary/30">
                <AvatarImage src={detailPerson?.image_url || undefined} className="object-cover" />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {detailPerson?.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="font-display text-xl">{detailPerson?.name}</DialogTitle>
                {detailPerson?.relationship && (
                  <DialogDescription className="text-xs font-semibold text-primary mt-0.5">
                    {detailPerson.relationship}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-3 text-xs">
            {detailPerson?.description && (
              <div>
                <span className="font-semibold text-muted-foreground uppercase text-[0.65rem] block mb-1">
                  About
                </span>
                <p className="text-sm leading-relaxed text-foreground">{detailPerson.description}</p>
              </div>
            )}

            {detailPerson?.important_info && (
              <div className="rounded-xl bg-primary/5 p-3 border border-primary/15">
                <span className="font-semibold text-primary uppercase text-[0.65rem] flex items-center gap-1 mb-1">
                  <Heart className="size-3" /> Important to remember
                </span>
                <p className="text-xs text-foreground leading-relaxed">{detailPerson.important_info}</p>
              </div>
            )}

            {detailPerson?.last_interaction && (
              <div className="text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border">
                <Calendar className="size-3.5 text-primary" />
                Last interaction: {format(new Date(detailPerson.last_interaction), "MMMM d, yyyy")}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDetailPerson(null);
                setAddMemOpen(true);
              }}
              className="rounded-xl text-xs gap-1.5"
            >
              <Plus className="size-3.5" />
              Add Memory for {detailPerson?.name.split(" ")[0]}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MemoryModal
        open={addMemOpen}
        onOpenChange={setAddMemOpen}
        memory={null}
        onSuccess={refreshData}
      />
    </div>
  );
}
