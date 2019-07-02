import { Option, Struct } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { Bounds } from '../../alien/Boxes';
import { AnchorOverrides, MaxHeightFunction } from '../mode/Anchoring';
import * as Callouts from '../view/Callouts';
import { Anchor } from './Anchor';
import { Bubble } from './Bubble';
import * as LayoutTypes from './LayoutTypes';
import * as MaxHeight from './MaxHeight';
import * as Origins from './Origins';

export interface ReparteeOptionsSpec {
  bounds?: Bounds;
  origin?: Origins.OriginAdt;
  preference?: LayoutTypes.AnchorLayout[];
  maxHeightFunction?: MaxHeightFunction;
}

export interface ReparteeOptions {
  bounds: () => Bounds;
  origin: () => Origins.OriginAdt;
  preference: () => LayoutTypes.AnchorLayout[];
  maxHeightFunction: () => MaxHeightFunction;
}

const reparteeOptions = Struct.immutableBag(['bounds', 'origin', 'preference', 'maxHeightFunction'], []) as (obj) => ReparteeOptions;
const defaultOr = (options, key, dephault) => {
  return options[key] === undefined ? dephault : options[key];
};

// This takes care of everything when you are positioning UI that can go anywhere on the screen
const simple = (anchor: Anchor, element: Element, bubble: Bubble, layouts: LayoutTypes.AnchorLayout[], getBounds: Option<() => Bounds>, overrideOptions: AnchorOverrides): void => {
  // the only supported override at the moment. Once relative has been deleted, maybe this can be optional in the bag
  const maxHeightFunction: MaxHeightFunction = defaultOr(overrideOptions, 'maxHeightFunction', MaxHeight.anchored());

  const anchorBox = anchor.anchorBox();
  const origin = anchor.origin();

  const options = reparteeOptions({
    bounds: Origins.viewport(origin, getBounds),
    origin,
    preference: layouts,
    maxHeightFunction
  });

  go(anchorBox, element, bubble, options);
};

// This is the old public API. If we ever need full customisability again, this is how to expose it
const go = (anchorBox: LayoutTypes.AnchorBox, element: Element, bubble: Bubble, options: ReparteeOptions) => {
  const decision = Callouts.layout(anchorBox, element, bubble, options);

  Callouts.position(element, decision, options);
  Callouts.setClasses(element, decision);
  Callouts.setHeight(element, decision, options);
};

export {
  simple
};
