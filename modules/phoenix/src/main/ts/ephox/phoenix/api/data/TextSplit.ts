import { Option, Struct } from '@ephox/katamari';

export interface TextSplit<E> {
  before(): Option<E>;
  after(): Option<E>;
}
type TextSplitConstructor = <E>(before: Option<E>, after: Option<E>) => TextSplit<E>;

export const TextSplit = <TextSplitConstructor>Struct.immutable('before', 'after');