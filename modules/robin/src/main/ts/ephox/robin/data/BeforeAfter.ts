import { Optional } from '@ephox/katamari';

export interface BeforeAfter {
  readonly before: Optional<number>;
  readonly after: Optional<number>;
}

export const BeforeAfter = (before: Optional<number>, after: Optional<number>): BeforeAfter => ({
  before,
  after
});
