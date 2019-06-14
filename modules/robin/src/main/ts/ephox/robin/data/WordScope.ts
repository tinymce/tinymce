import { Option, Struct } from '@ephox/katamari';

export interface WordScope {
  word: () => string;
  left: () => Option<string>;
  right: () => Option<string>;
}

export const WordScope: (word: string, left: Option<string>, right: Option<string>) => WordScope = Struct.immutable('word', 'left', 'right');