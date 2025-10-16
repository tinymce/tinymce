export const forEachChunk = async <T>(
  stream: ReadableStream<T>,
  onChunk: (chunk: T) => void
): Promise<void> => {
  const reader = stream.getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      onChunk(value);
    }
  } finally {
    reader.releaseLock();
  }
};
