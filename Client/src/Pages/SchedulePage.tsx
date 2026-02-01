import React, { useEffect, useState, useRef, useMemo, useCallback, Suspense, lazy } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTasks, useUpsertTask, useDeleteTask } from "@/hooks/use-tasks";
import { ThemeSelector } from "@/components/ThemeSelector";
import { DayColumn } from "@/components/DayColumn";
import { eachDayOfInterval, format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, eachMonthOfInterval, eachWeekOfInterval, addMonths, startOfYear, endOfYear, isSameMonth, isSameWeek } from "date-fns";
import { type Task, identitySentences } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, ChevronLeft, ChevronRight, LayoutGrid, ListTodo, ShieldCheck, StickyNote, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TaskDialog = lazy(() => import("@/components/TaskDialog").then(m => ({ default: m.TaskDialog })));

type NavLevel = 'year' | 'month' | 'week' | 'day';

function MonthGoalField({ month }: { month: string }) {
  const { data: goal } = useQuery<any>({ queryKey: [`/api/month-goals/${month}`] });
  const [content, setContent] = useState("");
  useEffect(() => { if (goal) setContent(goal.content); }, [goal]);

  const upsertMutation = useMutation({
    mutationFn: (content: string) => apiRequest("POST", `/api/month-goals/${month}`, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/month-goals/${month}`] })
  });

  return (
    <div className="bg-card/30 p-4 rounded-xl border border-border/40 mb-6">
      <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-2">Monthly Goal</label>
      <div className="flex gap-2">
        <Textarea 
          placeholder="What's the main focus for this month?" 
          value={content} 
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[60px] text-sm bg-background/50 border-none focus-visible:ring-1"
        />
        <Button size="sm" onClick={() => upsertMutation.mutate(content)} disabled={upsertMutation.isPending} className="h-auto">Save</Button>
      </div>
    </div>
  );
}

function RulesDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { data: rules } = useQuery<any[]>({ queryKey: ["/api/rules"] });
  const [newRule, setNewRule] = useState("");
  const createMutation = useMutation({
    mutationFn: (content: string) => apiRequest("POST", "/api/rules", { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rules"] });
      setNewRule("");
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/rules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/rules"] })
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Personal Rules</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Textarea 
              placeholder="Add a new rule..." 
              value={newRule} 
              onChange={(e) => setNewRule(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={() => createMutation.mutate(newRule)} disabled={!newRule.trim() || createMutation.isPending}>Add</Button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {rules?.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-sm">{rule.content}</p>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(rule.id)} className="text-destructive hover:bg-destructive/10">Remove</Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NotesDialog({ isOpen, onClose, date }: { isOpen: boolean, onClose: () => void, date: string }) {
  const { data: note } = useQuery<any>({ queryKey: [`/api/notes/${date}`] });
  const [content, setContent] = useState("");
  useEffect(() => { if (note) setContent(note.content); }, [note]);

  const upsertMutation = useMutation({
    mutationFn: (content: string) => apiRequest("POST", `/api/notes/${date}`, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/notes/${date}`] })
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Notes - {format(new Date(date), "MMM d")}</DialogTitle></DialogHeader>
        <div className="py-4">
          <Textarea 
            placeholder="Write something..." 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] text-base"
          />
        </div>
        <DialogFooter>
          <Button onClick={() => upsertMutation.mutate(content)} disabled={upsertMutation.isPending}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SchedulePage() {
  const { user, logout } = useAuth();
  const { data: tasks, isLoading } = useTasks("2024-01-01", "2026-12-31");
  const { toast } = useToast();
  
  const [dialogState, setDialogState] = useState<{ isOpen: boolean; date: string; task?: Task }>({ isOpen: false, date: "" });
  const [showRules, setShowRules] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Navigation state
  const [level, setLevel] = useState<NavLevel>('year');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => {
    return eachMonthOfInterval({
      start: startOfYear(new Date(selectedYear, 0, 1)),
      end: endOfYear(new Date(selectedYear, 0, 1))
    });
  }, [selectedYear]);

  const weeks = useMemo(() => {
    if (!selectedMonth) return [];
    return eachWeekOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    });
  }, [selectedMonth]);

  const days = useMemo(() => {
    if (!selectedWeek) return [];
    return eachDayOfInterval({
      start: startOfWeek(selectedWeek),
      end: endOfWeek(selectedWeek)
    }).map(d => format(d, "yyyy-MM-dd"));
  }, [selectedWeek]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    if (!tasks) return map;
    tasks.forEach(t => {
      const existing = map.get(t.date) || [];
      existing.push(t);
      map.set(t.date, existing);
    });
    return map;
  }, [tasks]);

  const reputation = useMemo(() => {
    if (!tasks) return 0;
    const completed = tasks.filter(t => t.completed).length;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const failed = tasks.filter(t => !t.completed && t.date < todayStr).length;
    return (completed * 10) - (failed * 5);
  }, [tasks]);

  const dailySentence = useMemo(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return identitySentences[dayOfYear % identitySentences.length];
  }, []);

  const stats = useMemo(() => {
    if (!tasks) return { week: { pct: 0, c: 0, f: 0 }, month: { pct: 0, c: 0, f: 0 } };
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    
    const weekInterval = { start: startOfWeek(today), end: endOfWeek(today) };
    const monthInterval = { start: startOfMonth(today), end: endOfMonth(today) };

    const getStats = (interval: { start: Date; end: Date }) => {
      const filtered = tasks.filter(t => isWithinInterval(parseISO(t.date), interval));
      const c = filtered.filter(t => t.completed).length;
      const f = filtered.filter(t => !t.completed && t.date < todayStr).length;
      const total = filtered.length;
      return { pct: total ? Math.round((c / total) * 100) : 0, c, f };
    };

    return { week: getStats(weekInterval), month: getStats(monthInterval) };
  }, [tasks]);

  const handleSlotClick = useCallback((date: string, task?: Task) => {
    setDialogState({ isOpen: true, date, task });
  }, []);

  const goBack = () => {
    if (level === 'day') setLevel('week');
    else if (level === 'week') setLevel('month');
    else if (level === 'month') setLevel('year');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium animate-pulse mt-4">Loading Trueplan...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-20 border-b border-border/40 bg-card/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-xl shadow-primary/25 text-xl">TP</div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-2xl tracking-tight">Trueplan</h1>
              <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">R:{reputation}</span>
            </div>
            <p className="text-xs text-muted-foreground italic mt-1.5 opacity-80">{dailySentence}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4 border-r border-border/20 pr-6 mr-2">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Week</p>
              <p className="text-sm font-mono">{stats.week.pct}% <span className="text-[10px] opacity-40">({stats.week.c}/{stats.week.f})</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Month</p>
              <p className="text-sm font-mono">{stats.month.pct}% <span className="text-[10px] opacity-40">({stats.month.c}/{stats.month.f})</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowRules(true)} className="gap-2 text-xs opacity-60 hover:opacity-100 transition-all"><ShieldCheck className="w-4 h-4" /> Rules</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowNotes(true)} className="gap-2 text-xs opacity-60 hover:opacity-100 transition-all"><StickyNote className="w-4 h-4" /> Notes</Button>
          </div>
          <ThemeSelector />
          <Button variant="ghost" size="icon" onClick={() => logout()} className="text-muted-foreground hover:text-destructive transition-colors ml-2"><LogOut className="w-5 h-5" /></Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            {level !== 'year' && (
              <Button variant="outline" size="sm" onClick={goBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
            <h2 className="text-3xl font-display font-bold">
              {level === 'year' && `Year ${selectedYear}`}
              {level === 'month' && format(selectedMonth!, "MMMM yyyy")}
              {level === 'week' && `Week of ${format(selectedWeek!, "MMM d, yyyy")}`}
              {level === 'day' && "Weekly View"}
            </h2>
          </div>

          <div className="flex-1 min-h-0">
            {level === 'year' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {months.map(month => (
                  <Button 
                    key={month.getTime()} 
                    variant="outline" 
                    className="h-32 text-xl font-display flex flex-col gap-1 items-center justify-center bg-card/40 hover:bg-card border-border/30 hover:border-primary/50 transition-all"
                    onClick={() => { setSelectedMonth(month); setLevel('month'); }}
                  >
                    <span>{format(month, "MMMM")}</span>
                    <span className="text-xs opacity-40 font-mono tracking-widest">{selectedYear}</span>
                  </Button>
                ))}
              </div>
            )}

            {level === 'month' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MonthGoalField month={format(selectedMonth!, "yyyy-MM")} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {weeks.map((week, idx) => (
                    <Button 
                      key={week.getTime()} 
                      variant="outline" 
                      className="h-24 text-lg font-display flex flex-col gap-1 items-center justify-center bg-card/40 hover:bg-card border-border/30 hover:border-primary/50 transition-all"
                      onClick={() => { setSelectedWeek(week); setLevel('week'); }}
                    >
                      <span>Week {idx + 1}</span>
                      <span className="text-xs opacity-40 font-mono">{format(week, "MMM d")} - {format(endOfWeek(week), "MMM d")}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {level === 'week' && (
              <div className="flex flex-row gap-6 h-full overflow-x-auto pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 scrollbar-hide">
                {days.map((date) => (
                  <DayColumn 
                    key={date}
                    date={date}
                    tasks={tasksByDate.get(date) || []}
                    onSlotClick={(task) => handleSlotClick(date, task)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <TaskDialog isOpen={dialogState.isOpen} onClose={() => setDialogState(prev => ({ ...prev, isOpen: false }))} date={dialogState.date} existingTask={dialogState.task} />
        <RulesDialog isOpen={showRules} onClose={() => setShowRules(false)} />
        <NotesDialog isOpen={showNotes} onClose={() => setShowNotes(false)} date={format(new Date(), "yyyy-MM-dd")} />
      </Suspense>
    </div>
  );
  }
        
