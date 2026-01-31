import { useEffect, useState } from "react";
import { useUpsertTask, useDeleteTask } from "@/hooks/use-tasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Save, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { type Task } from "@shared/schema";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  existingTask?: Task;
}

export function TaskDialog({ isOpen, onClose, date, existingTask }: TaskDialogProps) {
  const [content, setContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const upsertTask = useUpsertTask();
  const deleteTask = useDeleteTask();

  useEffect(() => {
    if (isOpen) {
      setContent(existingTask?.content || "");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, existingTask]);

  const handleSave = async (completed: boolean = false) => {
    if (!content.trim()) return;

    await upsertTask.mutateAsync({
      date,
      content,
      completed: existingTask ? existingTask.completed : completed,
    });
    onClose();
  };

  const handleToggleStatus = async () => {
    if (!existingTask) return;
    
    await upsertTask.mutateAsync({
      date,
      content,
