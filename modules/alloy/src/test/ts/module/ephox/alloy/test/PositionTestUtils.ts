import { Chain, Guard, NamedChain } from '@ephox/agar';
import { Optional, Result } from '@ephox/katamari';
import { Css, Scroll, SugarElement, Traverse } from '@ephox/sugar';

import { Bounds } from 'ephox/alloy/alien/Boxes';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

const cAddPopupToSinkCommon = (data: Record<string, any>, sink: AlloyComponent, positioner: () => void): Result<Record<string, any>, unknown> => {
  Attachment.attach(sink, data.popup);
  positioner();
  return Result.value(data);
};

const cAddPopupToSink = (sinkName: string): NamedChain => NamedChain.bundle((data) => {
  const sink = data[sinkName];
  const positioner = () => Positioning.position(sink, data.anchor, data.popup);
  return cAddPopupToSinkCommon(data, sink, positioner);
});

const cAddPopupToSinkWithin = (sinkName: string, elem: SugarElement): NamedChain => NamedChain.bundle((data) => {
  const sink = data[sinkName];
  const boxElement = Optional.some(elem);
  const positioner = () => Positioning.positionWithin(sink, data.anchor, data.popup, boxElement);
  return cAddPopupToSinkCommon(data, sink, positioner);
});

const cAddPopupToSinkWithinBounds = (sinkName: string, bounds: Bounds): NamedChain => NamedChain.bundle((data) => {
  const sink = data[sinkName];
  const optBounds = Optional.some(bounds);
  const positioner = () => Positioning.positionWithinBounds(sink, data.anchor, data.popup, optBounds);
  return cAddPopupToSinkCommon(data, sink, positioner);
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

const cAddTopBottomMargin = (amount: string): Chain<AlloyComponent, AlloyComponent> => Chain.mapper((component) => {
  Css.set(component.element, 'margin-top', amount);
  Css.set(component.element, 'margin-bottom', amount);
  return component;
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

const cTestSinkWithin = (label: string, sinkName: string, elem: SugarElement): NamedChain => ChainUtils.cLogging(
  label,
  [
    cAddPopupToSinkWithin(sinkName, elem),
    cTestSinkPopupPosition(sinkName)
  ]
);

const cTestSinkWithinBounds = (label: string, sinkName: string, bounds: Bounds): NamedChain => ChainUtils.cLogging(
  label,
  [
    cAddPopupToSinkWithinBounds(sinkName, bounds),
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
  cTestSinkWithin,
  cTestSinkWithinBounds,
  cScrollDown
};
