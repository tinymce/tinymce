import { SpotInfo } from '../view/SpotInfo';
import { Bubble } from './Bubble';

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
  bubbles: Bubble
) => SpotInfo;
