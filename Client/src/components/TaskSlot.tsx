import React from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { type Task } from "@shared/schema";
import { isBefore, parseISO, startOfDay } from "date-fns";

interface TaskSlotProps {
  task: Task;
  date: string;
  onClick: () => void;
}

export const TaskSlot = React.memo(function TaskSlot({ task, date, onClick }: TaskSlotProps) {
  // Determine visual state
  const isCompleted = task.completed;
  const isPast = isBefore(parseISO(date), startOfDay(new Date()));
  const isMissed = !isCompleted && isPast; 

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full h-12 px-4 text-left transition-all duration-200 ease-out",
        "border rounded-lg bg-card shadow-sm border-border/80",
        "flex items-center gap-3 overflow-hidden",
        
        // Completed state
        isCompleted && "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300 hover:bg-green-500/20 hover:border-green-500/50",
        
        // Missed state
        isMissed && "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300 hover:bg-red-500/20 hover:border-red-500/50",
      )}
    >
      <span className="flex-1 truncate text-sm font-medium">
        {task.content}
      </span>

      {/* Status Icons */}
      {isCompleted && (
        <div className="bg-green-500 text-white rounded-full p-0.5 shrink-0">
          <Check className="w-3 h-3" strokeWidth={3} />
        </div>
      )}
      
      {isMissed && (
        <div className="bg-red-500 text-white rounded-full p-0.5 shrink-0">
          <X className="w-3 h-3" strokeWidth={3} />
        </div>
      )}
    </button>
  );
});
