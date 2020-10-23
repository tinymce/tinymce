import { Optional } from '@ephox/katamari';

export interface TextSplit<E> {
  readonly before: Optional<E>;
  readonly after: Optional<E>;
}

export const TextSplit = <E>(before: Optional<E>, after: Optional<E>): TextSplit<E> => ({
  before,
  after
});
