import { Option, Struct } from '@ephox/katamari';

export interface BeforeAfter {
  before: () => Option<number>;
  after: () => Option<number>;
}

export const BeforeAfter: (before: Option<number>, after: Option<number>) => BeforeAfter = Struct.immutable('before', 'after');