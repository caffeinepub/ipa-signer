import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Certificate, JobStatus } from "../backend.d";
import { useActor } from "./useActor";

export function useGetCertificates() {
  const { actor, isFetching } = useActor();
  return useQuery<Certificate[]>({
    queryKey: ["certificates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCertificates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJobStatus(jobId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<JobStatus>({
    queryKey: ["jobStatus", jobId],
    queryFn: async () => {
      if (!actor || !jobId) throw new Error("No job ID");
      return actor.getJobStatus(jobId);
    },
    enabled: !!actor && !isFetching && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data === "pending") return 2000;
      return false;
    },
  });
}

export function useSubmitSigningJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<
    string,
    Error,
    { ipaFilename: string; certificateName: string }
  >({
    mutationFn: async ({ ipaFilename, certificateName }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitSigningJob(ipaFilename, certificateName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
}
