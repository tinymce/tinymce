import { Chain, Guard, NamedChain } from '@ephox/agar';
import { window } from '@ephox/dom-globals';
import { Result, Option } from '@ephox/katamari';
import { Css, Scroll, Traverse } from '@ephox/sugar';

import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as ChainUtils from 'ephox/alloy/test/ChainUtils';
import * as Sinks from 'ephox/alloy/test/Sinks';

const cAddPopupToSinkCommon = (data, sink, positioner) => {
  Attachment.attach(sink, data.popup);
  positioner();
  return Result.value(data);
};

const cAddPopupToSink = (sinkName) => {
  return NamedChain.bundle((data: any) => {
    const sink = data[sinkName];
    const positioner = () => Positioning.position(sink, data.anchor, data.popup);
    return cAddPopupToSinkCommon(data, sink, positioner);
  });
};

const cAddPopupToSinkWithin = (sinkName, elem) => {
  return NamedChain.bundle((data: any) => {
    const sink = data[sinkName];
    const boxElement = Option.some(elem);
    const positioner = () => Positioning.positionWithin(sink, data.anchor, data.popup, boxElement);
    return cAddPopupToSinkCommon(data, sink, positioner);
  });
};

const cTestPopupInSink = (label, sinkName) => {
  return Chain.control(
    NamedChain.bundle((data: any) => {
      const sink = data[sinkName];
      const inside = Sinks.isInside(sink, data.popup);
      return inside ? Result.value(data) : Result.error(
        new Error('The popup does not appear within the ' + label + ' sink container')
      );
    }),
    Guard.tryUntil('Ensuring that the popup is inside the ' + label + ' sink')
  );
};

const cTestPopupInViewport = (sinkName) => {
  return Chain.control(
    NamedChain.bundle((data: any) => {
      const bounds = data.popup.element().dom().getBoundingClientRect();
      const inside = bounds.top >= 0 && bounds.left >= 0 && bounds.top <= window.innerHeight && bounds.left <= window.innerWidth;
      return inside ? Result.value(data) : Result.error(
        new Error('The popup does not appear within window viewport for the ' + sinkName + ' sink')
      );
    }),
    Guard.tryUntil('Ensuring that the popup is inside window viewport for the ' + sinkName + ' sink')
  );
};

const cScrollTo = Chain.mapper((component: any) => {
  component.element().dom().scrollIntoView();
  const doc = Traverse.owner(component.element());
  return Scroll.get(doc);
});

const cAddTopBottomMargin = (amount) => {
  return Chain.mapper((component: any) => {
    Css.set(component.element(), 'margin-top', amount);
    Css.set(component.element(), 'margin-bottom', amount);
    return component;
  });
};

const cTestSink = (label, sinkName) => {
  return ChainUtils.cLogging(
    label,
    [
      cAddPopupToSink(sinkName),
      cTestPopupInSink(sinkName, sinkName),
      cTestPopupInViewport(sinkName)
    ]
  );
};

const cTestSinkWithin = (label, sinkName, elem) => {
  return ChainUtils.cLogging(
    label,
    [
      cAddPopupToSinkWithin(sinkName, elem),
      cTestPopupInSink(sinkName, sinkName),
      cTestPopupInViewport(sinkName)
    ]
  );
};

const cScrollDown = (componentName: string, amount: string) => {
  return ChainUtils.cLogging(
    'Adding margin to ' + componentName + ' and scrolling to it',
    [
      NamedChain.direct(componentName, cAddTopBottomMargin(amount), '_'),
      NamedChain.direct(componentName, cScrollTo, '_')
    ]
  );
};

export {
  cTestSink,
  cTestSinkWithin,
  cScrollDown
};
