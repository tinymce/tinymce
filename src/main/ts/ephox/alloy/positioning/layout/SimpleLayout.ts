import { Option, Struct } from '@ephox/katamari';

import * as Callouts from '../view/Callouts';
import * as Boxes from './Boxes';
import * as Layout from './Layout';
import * as MaxHeight from './MaxHeight';
import * as Origins from './Origins';
import { Anchor } from '../../positioning/layout/Anchor';
import { Element } from '@ephox/sugar';
import { Bubble } from '../../positioning/layout/Bubble';
import { AnchorLayout, AnchorBox } from './Layout';
import { AnchorOverrides, MaxHeightFunction } from '../../positioning/mode/Anchoring';
import { Bounds } from '../../alien/Boxes';
import { OriginAdt } from './Origins';

export interface ReparteeOptionsSpec {
  bounds?: Bounds;
  origin?: OriginAdt;
  preference?: AnchorLayout[];
  maxHeightFunction?: MaxHeightFunction;
}

export interface ReparteeOptions {
  bounds: () => Bounds;
  origin: () => OriginAdt;
  preference: () => AnchorLayout[];
  maxHeightFunction: () => MaxHeightFunction;
}

const reparteeOptions = Struct.immutableBag(['bounds', 'origin', 'preference', 'maxHeightFunction'], []) as (obj) => ReparteeOptions
const defaultOr = (options, key, dephault) => {
  return options[key] === undefined ? dephault : options[key];
};

// This takes care of everything when you are positioning UI that can go anywhere on the screen (position: fixed)
const fixed = (anchor: Anchor, element: Element, bubble: Bubble, layouts: AnchorLayout[], overrideOptions: AnchorOverrides): void => {
  // the only supported override at the moment. Once relative has been deleted, maybe this can be optional in the bag
  const maxHeightFunction: MaxHeightFunction = defaultOr(overrideOptions, 'maxHeightFunction', MaxHeight.anchored());

  const anchorBox = anchor.anchorBox();
  const origin = anchor.origin();

  const options = reparteeOptions({
    bounds: Origins.viewport(origin, Option.none()),
    origin,
    preference: layouts,
    maxHeightFunction
  });

  go(anchorBox, element, bubble, options);
};

const relative = (anchorBox: AnchorBox, element: Element, bubble: Bubble, optionsSpec: ReparteeOptionsSpec): void => {
  const defaults = (_opts) => {
    const opts = _opts !== undefined ? _opts : {};
    return reparteeOptions({
      bounds: defaultOr(opts, 'bounds', Boxes.view()),
      origin: defaultOr(opts, 'origin', Origins.none()),
      preference: defaultOr(opts, 'preference', Layout.all()),
      maxHeightFunction: defaultOr(opts, 'maxHeightFunction', MaxHeight.anchored())
    });
  };

  const options: ReparteeOptions = defaults(optionsSpec);
  go(anchorBox, element, bubble, options);
};

// This is the old public API. If we ever need full customisability again, this is how to expose it
const go = (anchorBox: AnchorBox, element: Element, bubble: Bubble, options: ReparteeOptions) => {
  const decision = Callouts.layout(anchorBox, element, bubble, options);

  Callouts.position(element, decision, options);
  Callouts.setClasses(element, decision);
  Callouts.setHeight(element, decision, options);
};

export {
  fixed,
  relative
};