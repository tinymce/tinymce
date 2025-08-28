import type { SugarElement } from '@ephox/sugar';

import type * as Boxes from '../../alien/Boxes';
import type { SpotInfo } from '../view/SpotInfo';

import type { Bubble } from './Bubble';
import type { Placement } from './Placement';

export interface AnchorBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface AnchorElement {
  readonly width: number;
  readonly height: number;
}

export type AnchorLayout = (
  anchor: AnchorBox,
  element: AnchorElement,
  bubbles: Bubble,
  placee: SugarElement<HTMLElement>,
  bounds: Boxes.Bounds
) => SpotInfo;

export interface PlacerResult {
  readonly layout: string;
  readonly placement: Placement;
}
