import { Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { Bounds } from '../../alien/Boxes';
import { AnchorOverrides, MaxHeightFunction, MaxWidthFunction } from '../mode/Anchoring';
import * as Callouts from '../view/Callouts';
import { Transition } from '../view/Transitions';
import { Anchor } from './Anchor';
import { Bubble } from './Bubble';
import { PlacerResult } from './LayoutTypes';
import * as LayoutTypes from './LayoutTypes';
import * as MaxHeight from './MaxHeight';
import * as Origins from './Origins';

export interface ReparteeOptions {
  readonly bounds: Bounds;
  readonly origin: Origins.OriginAdt;
  readonly preference: LayoutTypes.AnchorLayout[];
  readonly maxHeightFunction: MaxHeightFunction;
  readonly maxWidthFunction: MaxWidthFunction;
  readonly lastPlacement: Optional<PlacerResult>;
  readonly transition: Optional<Transition>;
}

const defaultOr = <K extends keyof AnchorOverrides>(options: AnchorOverrides, key: K, dephault: NonNullable<AnchorOverrides[K]>): NonNullable<AnchorOverrides[K]> => options[key] === undefined ? dephault : options[key] as NonNullable<AnchorOverrides[K]>;

// This takes care of everything when you are positioning UI that can go anywhere on the screen
const simple = (
  anchor: Anchor,
  element: SugarElement<HTMLElement>,
  bubble: Bubble,
  layouts: LayoutTypes.AnchorLayout[],
  lastPlacement: Optional<PlacerResult>,
  optBounds: Optional<Bounds>,
  overrideOptions: AnchorOverrides,
  transition: Optional<Transition>
): PlacerResult => {
  // the only supported override at the moment. Once relative has been deleted, maybe this can be optional in the bag
  const maxHeightFunction: MaxHeightFunction = defaultOr(overrideOptions, 'maxHeightFunction', MaxHeight.anchored());
  const maxWidthFunction: MaxWidthFunction = defaultOr(overrideOptions, 'maxWidthFunction', Fun.noop);

  const anchorBox = anchor.anchorBox;
  const origin = anchor.origin;

  const options: ReparteeOptions = {
    bounds: Origins.viewport(origin, optBounds),
    origin,
    preference: layouts,
    maxHeightFunction,
    maxWidthFunction,
    lastPlacement,
    transition
  };

  return go(anchorBox, element, bubble, options);
};

// This is the old public API. If we ever need full customisability again, this is how to expose it
const go = (anchorBox: LayoutTypes.AnchorBox, element: SugarElement<HTMLElement>, bubble: Bubble, options: ReparteeOptions): PlacerResult => {
  const decision = Callouts.layout(anchorBox, element, bubble, options);

  Callouts.position(element, decision, options);
  Callouts.setPlacement(element, decision);
  Callouts.setClasses(element, decision);
  Callouts.setHeight(element, decision, options);
  Callouts.setWidth(element, decision, options);

  return {
    layout: decision.layout,
    placement: decision.placement
  };
};

export { simple };
