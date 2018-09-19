import { Option, Struct, Fun } from '@ephox/katamari';

import * as Callouts from '../view/Callouts';
import * as Boxes from './Boxes';
import * as Layout from './Layout';
import * as MaxHeight from './MaxHeight';
import * as Origins from './Origins';
import { Anchor } from '../../positioning/layout/Anchor';
import { Element } from '@ephox/sugar';
import { Bubble } from '../../positioning/layout/Bubble';
import { AnchorOverrides, MaxHeightFunction } from '../../positioning/mode/Anchoring';
import { Bounds } from '../../alien/Boxes';

export interface ReparteeOptionsSpec {
  bounds?: Bounds;
  origin?: Origins.OriginAdt;
  preference?: Layout.AnchorLayout[];
  maxHeightFunction?: MaxHeightFunction;
}

export interface ReparteeOptions {
  bounds: () => Bounds;
  origin: () => Origins.OriginAdt;
  preference: () => Layout.AnchorLayout[];
  maxHeightFunction: () => MaxHeightFunction;
}

const reparteeOptions = Struct.immutableBag(['bounds', 'origin', 'preference', 'maxHeightFunction'], []) as (obj) => ReparteeOptions;
const defaultOr = (options, key, dephault) => {
  return options[key] === undefined ? dephault : options[key];
};

// This takes care of everything when you are positioning UI that can go anywhere on the screen
const simple = (anchor: Anchor, element: Element, bubble: Bubble, layouts: Layout.AnchorLayout[], getBounds: Option<() => Bounds>, overrideOptions: AnchorOverrides): void => {
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
const go = (anchorBox: Layout.AnchorBox, element: Element, bubble: Bubble, options: ReparteeOptions) => {
  const decision = Callouts.layout(anchorBox, element, bubble, options);

  Callouts.position(element, decision, options);
  Callouts.setClasses(element, decision);
  Callouts.setHeight(element, decision, options);
};

export {
  simple
};