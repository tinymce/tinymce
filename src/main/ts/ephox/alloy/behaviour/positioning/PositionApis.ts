import { ValueSchema } from '@ephox/boulder';
import { Css, Location } from '@ephox/sugar';

import * as Anchor from '../../positioning/layout/Anchor';
import * as Boxes from '../../positioning/layout/Boxes';
import * as Origins from '../../positioning/layout/Origins';
import * as SimpleLayout from '../../positioning/layout/SimpleLayout';
import AnchorSchema from '../../positioning/mode/AnchorSchema';

const getFixedOrigin = function () {
  return Origins.fixed(0, 0, window.innerWidth, window.innerHeight);
};

const getRelativeOrigin = function (component) {
  // This container is the origin.
  const position = Location.absolute(component.element());
  return Origins.relative(position.left(), position.top());
};

const placeFixed = function (_component, origin, anchoring, posConfig, placee) {
  const anchor = Anchor.box(anchoring.anchorBox());
  // TODO: Overrides for expanding panel
  SimpleLayout.fixed(anchor, placee.element(), anchoring.bubble(), anchoring.layouts(), anchoring.overrides());
};

const placeRelative = function (component, origin, anchoring, posConfig, placee) {
  const bounds = posConfig.bounds().getOr(Boxes.view());

  SimpleLayout.relative(
    anchoring.anchorBox(),
    placee.element(),
    anchoring.bubble(),
    {
      bounds,
      origin,
      preference: anchoring.layouts(),
      maxHeightFunction () { }
    }
  );
};

const place = function (component, origin, anchoring, posConfig, placee) {
  const f = posConfig.useFixed() ? placeFixed : placeRelative;
  f(component, origin, anchoring, posConfig, placee);
};

const position = function (component, posConfig, posState, anchor, placee) {
  debugger;
  const anchorage = ValueSchema.asStructOrDie('positioning anchor.info', AnchorSchema, anchor);
  const origin = posConfig.useFixed() ? getFixedOrigin() : getRelativeOrigin(component);

  // We set it to be fixed, so that it doesn't interfere with the layout of anything
  // when calculating anchors
  Css.set(placee.element(), 'position', 'fixed');

  const oldVisibility = Css.getRaw(placee.element(), 'visibility');
  // INVESTIGATE: Will hiding the popup cause issues for focus?
  Css.set(placee.element(), 'visibility', 'hidden');

  const placer = anchorage.placement();
  placer(component, posConfig, anchorage, origin).each(function (anchoring) {
    const doPlace = anchoring.placer().getOr(place);
    doPlace(component, origin, anchoring, posConfig, placee);
  });

  oldVisibility.fold(function () {
    Css.remove(placee.element(), 'visibility');
  }, function (vis) {
    Css.set(placee.element(), 'visibility', vis);
  });

  // We need to remove position: fixed put on by above code if it is not needed.
  if (
    Css.getRaw(placee.element(), 'left').isNone() &&
    Css.getRaw(placee.element(), 'top').isNone() &&
    Css.getRaw(placee.element(), 'right').isNone() &&
    Css.getRaw(placee.element(), 'bottom').isNone() &&
    Css.getRaw(placee.element(), 'position').is('fixed')
  ) { Css.remove(placee.element(), 'position'); }
};

const getMode = function (component, pConfig, pState) {
  return pConfig.useFixed() ? 'fixed' : 'absolute';
};

export {
  position,
  getMode
};