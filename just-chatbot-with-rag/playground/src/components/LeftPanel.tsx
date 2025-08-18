import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThreadList from "./ThreadList";
import { Thread, User } from "../types";
import { Button } from "./ui/button";

interface LeftPanelProps {
  users: User[];
  threads: Thread[];
  selectedUserId?: string;
  selectedThreadId?: string;
  onSelectUserId: (userId: string | undefined) => void;
  onSelectThread: (thread: Thread) => void;
  onLoadMoreThreads: (numItems: number) => void;
  canLoadMoreThreads: boolean;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  users,
  threads,
  selectedUserId,
  selectedThreadId,
  onSelectUserId,
  onSelectThread,
  onLoadMoreThreads,
  canLoadMoreThreads,
}) => {
  return (
    <div className="flex flex-col h-full border-r">
      <div className="panel-header">
        <Select
          value={selectedUserId || "no user"}
          onValueChange={(value) =>
            onSelectUserId(value === "no user" ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="no user" value="no user">
              No user
            </SelectItem>
            {users.map((user) => (
              <SelectItem key={user._id} value={user._id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="panel-content">
        <ThreadList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onSelectThread={onSelectThread}
          onLoadMore={() => onLoadMoreThreads(10)}
        />
        {canLoadMoreThreads && (
          <Button variant="outline" onClick={() => onLoadMoreThreads(10)}>
            Load More
          </Button>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
