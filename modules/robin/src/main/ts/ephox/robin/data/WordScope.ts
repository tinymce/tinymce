import { Optional } from '@ephox/katamari';

export interface WordScope {
  readonly word: string;
  readonly left: Optional<string>;
  readonly right: Optional<string>;
}

export const WordScope = (word: string, left: Optional<string>, right: Optional<string>): WordScope => ({
  word,
  left,
  right
});
