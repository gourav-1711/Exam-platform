import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from './custom-fetch';
import type { CurrentAffair } from './generated/api.schemas';

export const fetchCurrentAffairs = async (): Promise<CurrentAffair[]> => {
  return customFetch('/api/current-affairs', { method: 'GET' });
};

export const fetchCurrentAffair = async (id: number): Promise<CurrentAffair> => {
  return customFetch(`/api/current-affairs/${id}`, { method: 'GET' });
};

export const createCurrentAffair = async (data: Omit<CurrentAffair, 'id'>): Promise<CurrentAffair> => {
  return customFetch('/api/current-affairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const updateCurrentAffair = async (id: number, data: Partial<CurrentAffair>): Promise<CurrentAffair> => {
  return customFetch(`/api/current-affairs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const deleteCurrentAffair = async (id: number): Promise<void> => {
  return customFetch(`/api/current-affairs/${id}`, { method: 'DELETE' });
};

export const useCurrentAffairs = () => {
  return useQuery<CurrentAffair[], Error>({
    queryKey: ['current-affairs'],
    queryFn: fetchCurrentAffairs,
    staleTime: 60_000,
  });
};

export const useCurrentAffair = (id: number) => {
  return useQuery<CurrentAffair, Error>({
    queryKey: ['current-affair', id],
    queryFn: () => fetchCurrentAffair(id),
    enabled: !!id,
  });
};

export const useCreateCurrentAffair = () => {
  const qc = useQueryClient();
  return useMutation<CurrentAffair, Error, Omit<CurrentAffair, 'id'>>({
    mutationFn: createCurrentAffair,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['current-affairs'] }),
  });
};

export const useUpdateCurrentAffair = (id: number) => {
  const qc = useQueryClient();
  return useMutation<CurrentAffair, Error, Partial<CurrentAffair>>({
    mutationFn: (data: Partial<CurrentAffair>) => updateCurrentAffair(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['current-affair', id] }),
  });
};

export const useDeleteCurrentAffair = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteCurrentAffair,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['current-affairs'] }),
  });
}