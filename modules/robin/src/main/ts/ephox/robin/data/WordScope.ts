import { Optional, Struct } from '@ephox/katamari';

export interface WordScope {
  word: () => string;
  left: () => Optional<string>;
  right: () => Optional<string>;
}

export const WordScope: (word: string, left: Optional<string>, right: Optional<string>) => WordScope = Struct.immutable('word', 'left', 'right');
