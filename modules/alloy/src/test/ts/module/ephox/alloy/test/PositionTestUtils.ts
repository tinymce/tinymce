import { Chain, Guard, NamedChain, Waiter } from '@ephox/agar';
import { Optional, Result } from '@ephox/katamari';
import { Css, Scroll, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import { Bounds } from 'ephox/alloy/alien/Boxes';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import { PlacementSpec } from 'ephox/alloy/behaviour/positioning/PositioningTypes';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

const addPopupToSinkCommon = (popup: AlloyComponent, sink: AlloyComponent, positioner: () => void) => {
  Attachment.attach(sink, popup);
  positioner();
};

const addPopupToSink = (popup: AlloyComponent, placementSpec: PlacementSpec, sink: AlloyComponent) => {
  const positioner = () => Positioning.position(sink, popup, placementSpec);
  addPopupToSinkCommon(popup, sink, positioner);
};

const addPopupToSinkWithinBounds = (popup: AlloyComponent, placementSpec: PlacementSpec, sink: AlloyComponent, bounds: Bounds) => {
  const positioner = () => Positioning.positionWithinBounds(sink, popup, placementSpec, Optional.some(bounds));
  addPopupToSinkCommon(popup, sink, positioner);
};

const pTestPopupInSink = (sinkName: string, popup: AlloyComponent, sink: AlloyComponent): Promise<void> =>
  Waiter.pTryUntil(`Ensuring that the popup is inside the ${sinkName} sink`, () => {
    const inside = Sinks.isInside(sink, popup);
    assert.isTrue(inside, `The popup does not appear within the ${sinkName} sink container`);
  });

const pTestPopupInViewport = (sinkName: string, popup: AlloyComponent): Promise<void> =>
  Waiter.pTryUntil(`Ensuring that the popup is inside window viewport for the ${sinkName} sink`, () => {
    const bounds = popup.element.dom.getBoundingClientRect();
    const inside = bounds.top >= 0 && bounds.left >= 0 && bounds.top <= window.innerHeight && bounds.left <= window.innerWidth;
    assert.isTrue(inside, `The popup does not appear within the window viewport for the ${sinkName} sink`);
  });

const pTestPopupPosition = async (sinkName: string, popup: AlloyComponent, sink: AlloyComponent) => {
  await pTestPopupInSink(sinkName, popup, sink);
  await pTestPopupInViewport(sinkName, popup);
};

const pTestSink = async (sinkName: string, sink: AlloyComponent, popup: AlloyComponent, placementSpec: PlacementSpec): Promise<void> => {
  addPopupToSink(popup, placementSpec, sink);
  await pTestPopupPosition(sinkName, popup, sink);
};

const pTestSinkWithinBounds = async (sinkName: string, sink: AlloyComponent, popup: AlloyComponent, placementSpec: PlacementSpec, bounds: Bounds): Promise<void> => {
  addPopupToSinkWithinBounds(popup, placementSpec, sink, bounds);
  await pTestPopupPosition(sinkName, popup, sink);
};

const addTopBottomMargin = (component: AlloyComponent, amount: string): void => {
  Css.set(component.element, 'margin-top', amount);
  Css.set(component.element, 'margin-bottom', amount);
};

const cAddPopupToSink = (sinkName: string): NamedChain => NamedChain.bundle((data) => {
  addPopupToSink(data.popup, { anchor: data.anchor }, data[sinkName]);
  return Result.value(data);
});

const cAddPopupToSinkWithinBounds = (sinkName: string, getBounds: () => Bounds): NamedChain => NamedChain.bundle((data) => {
  addPopupToSinkWithinBounds(data.popup, { anchor: data.anchor }, data[sinkName], getBounds());
  return Result.value(data);
});

const cTestPopupInSink = (label: string, sinkName: string): NamedChain => Chain.control(
  NamedChain.bundle((data) => {
    const sink = data[sinkName];
    const inside = Sinks.isInside(sink, data.popup);
    return inside ? Result.value(data) : Result.error(
      new Error('The popup does not appear within the ' + label + ' sink container')
    );
  }),
  Guard.tryUntil('Ensuring that the popup is inside the ' + label + ' sink')
);

const cTestPopupInViewport = (sinkName: string): NamedChain => Chain.control(
  NamedChain.bundle((data) => {
    const bounds = data.popup.element.dom.getBoundingClientRect();
    const inside = bounds.top >= 0 && bounds.left >= 0 && bounds.top <= window.innerHeight && bounds.left <= window.innerWidth;
    return inside ? Result.value(data) : Result.error(
      new Error('The popup does not appear within window viewport for the ' + sinkName + ' sink')
    );
  }),
  Guard.tryUntil('Ensuring that the popup is inside window viewport for the ' + sinkName + ' sink')
);

const cScrollTo = Chain.mapper((component: AlloyComponent) => {
  component.element.dom.scrollIntoView();
  const doc = Traverse.owner(component.element);
  return Scroll.get(doc);
});

const cAddTopBottomMargin = (amount: string): Chain<AlloyComponent, AlloyComponent> => Chain.op((component) => {
  addTopBottomMargin(component, amount);
});

const cTestSinkPopupPosition = (sinkName: string): NamedChain => Chain.fromChains([
  cTestPopupInSink(sinkName, sinkName),
  cTestPopupInViewport(sinkName)
]);

const cTestSink = (label: string, sinkName: string): NamedChain => ChainUtils.cLogging(
  label,
  [
    cAddPopupToSink(sinkName),
    cTestSinkPopupPosition(sinkName)
  ]
);

const cTestSinkWithinBounds = (label: string, sinkName: string, getBounds: () => Bounds): NamedChain => ChainUtils.cLogging(
  label,
  [
    cAddPopupToSinkWithinBounds(sinkName, getBounds),
    cTestSinkPopupPosition(sinkName)
  ]
);

const cScrollDown = (componentName: string, amount: string): NamedChain => ChainUtils.cLogging(
  'Adding margin to ' + componentName + ' and scrolling to it',
  [
    NamedChain.direct(componentName, cAddTopBottomMargin(amount), '_'),
    NamedChain.direct(componentName, cScrollTo, '_')
  ]
);

export {
  cTestSink,
  cTestSinkWithinBounds,
  cScrollDown,
  pTestSink,
  pTestSinkWithinBounds
};
