import React, { useMemo } from "react";
import { format, isToday, isWeekend } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskSlot } from "./TaskSlot";
import { type Task } from "@shared/schema";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DayColumnProps {
  date: string; // YYYY-MM-DD
  tasks: Task[]; // Tasks for this specific day
  onSlotClick: (task?: Task) => void;
}

export const DayColumn = React.memo(function DayColumn({ date, tasks, onSlotClick }: DayColumnProps) {
  const dateObj = useMemo(() => new Date(date), [date]);
  const isCurrentDay = isToday(dateObj);
  const isWeekEnd = isWeekend(dateObj);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const failed = tasks.filter(t => !t.completed && new Date(date) < new Date(format(new Date(), "yyyy-MM-dd"))).length;
    return { completed, failed };
  }, [tasks, date]);

  return (
    <div className={cn(
      "flex-shrink-0 w-64 flex flex-col gap-3 p-4 rounded-2xl transition-colors content-visibility-auto",
      "border border-transparent",
      isCurrentDay ? "bg-primary/5 border-primary/20 shadow-xl shadow-primary/5" : "bg-card/40 hover:bg-card border-border/30"
    )}>
      {/* Header */}
      <div className="text-center pb-2 border-b border-border/10">
        <div className={cn(
          "text-xs font-bold uppercase tracking-widest mb-1",
          isCurrentDay ? "text-primary" : "text-muted-foreground"
        )}>
          {format(dateObj, "EEEE")}
        </div>
        <div className={cn(
          "text-2xl font-display font-bold",
          isCurrentDay ? "text-foreground" : "text-muted-foreground",
          isWeekEnd && !isCurrentDay && "text-red-400/70"
        )}>
          {format(dateObj, "MMM d")}
        </div>
        <div className="flex justify-center gap-3 mt-1 text-[10px] font-mono opacity-60">
          <span className="text-green-500">+{stats.completed}</span>
          <span className="text-red-500">-{stats.failed}</span>
        </div>
      </div>

      {/* Slots */}
      <div className="flex flex-col gap-2 flex-1">
        {tasks.map((task) => (
          <TaskSlot
            key={task.id}
            date={date}
            task={task}
            onClick={() => onSlotClick(task)}
          />
        ))}
        
        {tasks.length < 5 && (
          <Button
            variant="ghost"
            className="w-full h-12 border border-dashed border-border/40 rounded-lg hover:border-primary/50 hover:bg-primary/5 text-muted-foreground/40 gap-2"
            onClick={() => onSlotClick()}
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Add task</span>
          </Button>
        )}
      </div>
    </div>
  );
});
