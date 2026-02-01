import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateTaskRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useTasks(start?: string, end?: string) {
  const queryKey = [api.tasks.list.path, { start, end }];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = start && end 
        ? buildUrl(api.tasks.list.path) + `?start=${start}&end=${end}`
        : api.tasks.list.path;
        
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      
      const data = await res.json();
      return api.tasks.list.responses[200].parse(data);
    },
  });
}

export function useUpsertTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const validated = api.tasks.upsert.input.parse(data);
      const res = await fetch(api.tasks.upsert.path, {
        method: api.tasks.upsert.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.tasks.upsert.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save task");
      }

      return api.tasks.upsert.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
    },
    onError: (err) => {
      toast({
        
