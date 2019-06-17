import { Struct } from '@ephox/katamari';

export interface WordRange<E> {
  startContainer: () => E;
  startOffset: () => number;
  endContainer: () => E;
  endOffset: () => number;
}

export const WordRange: <E> (startContainer: E, startOffset: number, endContainer: E, endOffset: number) => WordRange<E> = Struct.immutable('startContainer', 'startOffset', 'endContainer', 'endOffset');