import { BotEditPage } from '@/features/bot/ui/bot-edit'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BotEditPage id={id} />
}
