import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../api/request'

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5m
    gcTime: 1000 * 60 * 10, // 10m
  })
}
