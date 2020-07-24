import { Optional, Struct } from '@ephox/katamari';

export interface BeforeAfter {
  before: () => Optional<number>;
  after: () => Optional<number>;
}

export const BeforeAfter: (before: Optional<number>, after: Optional<number>) => BeforeAfter = Struct.immutable('before', 'after');
