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
      completed: !existingTask.completed,
    });
    onClose();
  };

  const handleDelete = async () => {
    if (!existingTask) return;

    if (existingTask.content.trim() && !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    await deleteTask.mutateAsync(existingTask.id);
    onClose();
  };

  const dateObj = new Date(date);
  const displayDate = date && !isNaN(dateObj.getTime()) ? format(dateObj, "MMMM do, yyyy") : "Invalid date";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl border-border/40 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold">
            {existingTask ? "Edit Task" : "New Task"}
          </DialogTitle>
          <DialogDescription>
            {displayDate}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <Input
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What needs to be done?"
              className="text-lg py-6"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
          </div>

          {existingTask && (
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">Status</span>
                <p className="text-xs text-muted-foreground">
                  {existingTask.completed ? "Task completed" : "Pending completion"}
                </p>
              </div>
              <Button
                variant={existingTask.completed ? "default" : "outline"}
                size="sm"
                onClick={handleToggleStatus}
                className={existingTask.completed ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                {existingTask.completed ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Completed</>
                ) : (
                  <><XCircle className="w-4 h-4 mr-2" /> Mark Done</>
                )}
              </Button>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in slide-in-from-top-2">
              <p className="text-sm font-medium text-destructive mb-2">Are you sure you want to delete this task?</p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDelete}>Yes, delete</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          {existingTask ? (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
              disabled={deleteTask.isPending || showDeleteConfirm}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          ) : (
            <div /> 
          )}
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={() => handleSave()} 
              disabled={upsertTask.isPending || !content.trim() || showDeleteConfirm}
              className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Save className="w-4 h-4" />
              {existingTask ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
    }
    
