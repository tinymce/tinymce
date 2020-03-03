import { SpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';

export interface AnchorBox {
  x: () => number;
  y: () => number;
  width: () => number;
  height: () => number;
}

export interface AnchorElement {
  width: () => number;
  height: () => number;
}

export type AnchorLayout = (
  anchor: AnchorBox,
  element: AnchorElement,
  bubbles: Bubble
) => SpotInfo;
