export interface WordRange<E> {
  readonly startContainer: E;
  readonly startOffset: number;
  readonly endContainer: E;
  readonly endOffset: number;
}

export const WordRange = <E>(startContainer: E, startOffset: number, endContainer: E, endOffset: number): WordRange<E> => ({
  startContainer,
  startOffset,
  endContainer,
  endOffset
});
