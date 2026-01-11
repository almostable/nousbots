import { ChatPage } from '@/features/chat/ui/chat-page'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ChatPage id={id} />
}
