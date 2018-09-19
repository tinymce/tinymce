import { ValueSchema } from '@ephox/boulder';
import { Css } from '@ephox/sugar';
import * as Anchor from '../../positioning/layout/Anchor';
import * as Origins from '../../positioning/layout/Origins';
import * as SimpleLayout from '../../positioning/layout/SimpleLayout';
import AnchorSchema from '../../positioning/mode/AnchorSchema';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { PositioningConfig } from '../../behaviour/positioning/PositioningTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { AdtInterface } from '@ephox/boulder/lib/main/ts/ephox/boulder/alien/AdtDefinition';
import { Anchoring, AnchorSpec, AnchorDetail } from '../../positioning/mode/Anchoring';
import { window } from '@ephox/dom-globals';

export interface OriginAdt extends AdtInterface { }

const getFixedOrigin = (): OriginAdt => {
  return Origins.fixed(0, 0, window.innerWidth, window.innerHeight);
};

const getRelativeOrigin = (component: AlloyComponent): OriginAdt => {
  const bounds = component.element().dom().getBoundingClientRect(); // TODO: THIS USED TO BE LOCATION.ABSOLUTE, check it TODO TODO

  // Relative calculations are all adjusted to be relative to Boxes.view() so the bounding client rect of the origin is all we need
  return Origins.relative(bounds.left, bounds.top, bounds.width, bounds.height);
};

const place = (component: AlloyComponent, origin: OriginAdt, anchoring: Anchoring, posConfig: PositioningConfig, placee: AlloyComponent): void => {
  const anchor = Anchor.box(anchoring.anchorBox(), origin);
  SimpleLayout.simple(anchor, placee.element(), anchoring.bubble(), anchoring.layouts(), posConfig.getBounds(), anchoring.overrides());
};

const position = (component: AlloyComponent, posConfig: PositioningConfig, posState: Stateless, anchor: AnchorSpec, placee: AlloyComponent): void => {
  const anchorage: AnchorDetail<any> = ValueSchema.asStructOrDie('positioning anchor.info', AnchorSchema, anchor);
  const origin = posConfig.useFixed() ? getFixedOrigin() : getRelativeOrigin(component);

  // We set it to be fixed, so that it doesn't interfere with the layout of anything
  // when calculating anchors
  Css.set(placee.element(), 'position', 'fixed');

  const oldVisibility = Css.getRaw(placee.element(), 'visibility');
  // INVESTIGATE: Will hiding the popup cause issues for focus?
  Css.set(placee.element(), 'visibility', 'hidden');

  const placer = anchorage.placement();
  placer(component, posConfig, anchorage, origin).each((anchoring) => {
    const doPlace = anchoring.placer().getOr(place);
    doPlace(component, origin, anchoring, posConfig, placee);
  });

  oldVisibility.fold(() => {
    Css.remove(placee.element(), 'visibility');
  }, (vis) => {
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

const getMode = (component: AlloyComponent, pConfig: PositioningConfig, pState: Stateless): string => {
  return pConfig.useFixed() ? 'fixed' : 'absolute';
};

export {
  position,
  getMode
};