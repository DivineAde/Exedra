"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useCollaborationStore } from "@/stores/collaboration-store";

export function CollaboratorAvatars() {
  const presence = useCollaborationStore((s) => s.presence);

  if (presence.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex -space-x-2">
        {presence.slice(0, 5).map((user) => (
          <Tooltip key={user.userId}>
            <TooltipTrigger asChild>
              <Avatar style={{ borderColor: user.color }}>
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback style={{ backgroundColor: user.color }}>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>{user.name}</TooltipContent>
          </Tooltip>
        ))}
        {presence.length > 5 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
            +{presence.length - 5}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
