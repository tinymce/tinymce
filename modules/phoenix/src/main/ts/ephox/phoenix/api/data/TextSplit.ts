import { Optional, Struct } from '@ephox/katamari';

export interface TextSplit<E> {
  before(): Optional<E>;
  after(): Optional<E>;
}
type TextSplitConstructor = <E>(before: Optional<E>, after: Optional<E>) => TextSplit<E>;

export const TextSplit = <TextSplitConstructor> Struct.immutable('before', 'after');
