import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBot,
  getAllBots,
  getBotById,
  getMyBot,
  getMyBots,
} from '../api/request'
import { GetBotByIdDTO, GetMyBotDTO } from '@backend/unit/bot/contract'

export const useCreateBot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBots'] })
    },
  })
}

export const useGetAllBots = () => {
  return useQuery({
    queryKey: ['bots'],
    queryFn: getAllBots,
  })
}

export const useGetBotById = (data: Partial<GetBotByIdDTO>) => {
  return useQuery({
    queryKey: ['bot', data.id],
    queryFn: () => getBotById(data as GetBotByIdDTO),
    enabled: !!data.id,
  })
}

export const useGetMyBots = () => {
  return useQuery({
    queryKey: ['myBots'],
    queryFn: getMyBots,
  })
}

export const useGetMyBot = (data: GetMyBotDTO) => {
  return useQuery({
    queryKey: ['myBot'],
    queryFn: () => getMyBot({ id: data.id }),
  })
}
