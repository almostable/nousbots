import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createChat,
  deleteChat,
  getAllChats,
  getMessagesChat,
  getProgressChat,
} from '../api/request'
import {
  GetMessagesChatDTO,
  GetProgressChatDTO,
} from '@backend/unit/chat/contract'

const useCreateChat = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createChat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })

  return {
    createChat: mutation.mutateAsync,
    isCreateChatPending: mutation.isPending,
    createChatError: mutation.error,
  }
}

const useDeleteChat = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteChat,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.chatId],
      })
    },
  })
}

const useGetProgressChat = (data: GetProgressChatDTO) => {
  return useQuery({
    queryKey: ['progress', data.chatId],
    queryFn: () => getProgressChat(data),
  })
}

const useGetAllChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: getAllChats,
  })
}

const useGetMessagesChat = (data: GetMessagesChatDTO) => {
  return useQuery({
    queryKey: ['messages', data.id],
    queryFn: () => getMessagesChat(data),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    retry: 1,
  })
}

export {
  useCreateChat,
  useDeleteChat,
  useGetProgressChat,
  useGetAllChats,
  useGetMessagesChat,
}
