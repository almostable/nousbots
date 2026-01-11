import { BotPage } from '@/features/bot/ui/bot-page'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BotPage id={id} />
}
