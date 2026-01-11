export async function* readStream(response: Response) {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) return

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      yield chunk
    }
  } finally {
    reader.releaseLock()
  }
}
