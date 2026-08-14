"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiClient } from "@/services/api-client";
import { useUiStore } from "@/stores/ui-store";
import type { BoardMemberDTO } from "@whiteboard/shared-types";
import { Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ShareBoardDialog({ boardId }: { boardId: string }) {
  const { isShareDialogOpen, setShareDialogOpen } = useUiStore();
  const [email, setEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["board-members", boardId],
    queryFn: () => apiClient.get<BoardMemberDTO[]>(`/api/boards/${boardId}/members`),
    enabled: isShareDialogOpen,
  });

  const addMember = useMutation({
    mutationFn: () => apiClient.post(`/api/boards/${boardId}/members`, { email, role: "EDITOR" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-members", boardId] });
      setEmail("");
      toast.success("Invited");
    },
    onError: () => toast.error("Couldn't find a user with that email"),
  });

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  }

  return (
    <Dialog open={isShareDialogOpen} onOpenChange={setShareDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share board</DialogTitle>
          <DialogDescription>Invite people to view or edit this board.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) addMember.mutate();
          }}
          className="mb-4 flex gap-2"
        >
          <Input placeholder="Add people by email..." value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <Button type="submit" disabled={addMember.isPending}>
            {addMember.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Invite
          </Button>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">People with access</p>
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {members?.map((member) => (
            <div key={member.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{member.role === "OWNER" ? "Owner" : member.role === "EDITOR" ? "Can edit" : "Can view"}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">Anyone with the link and access can open this board.</p>
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Link2 className="h-4 w-4" /> Copy link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
