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
      
