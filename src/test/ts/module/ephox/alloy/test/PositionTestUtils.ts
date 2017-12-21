import { Chain } from '@ephox/agar';
import { Guard } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import Positioning from 'ephox/alloy/api/behaviour/Positioning';
import Attachment from 'ephox/alloy/api/system/Attachment';
import ChainUtils from 'ephox/alloy/test/ChainUtils';
import Sinks from 'ephox/alloy/test/Sinks';
import { Result } from '@ephox/katamari';
import { Css } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { Scroll } from '@ephox/sugar';

var cAddPopupToSink = function (sinkName) {
  return NamedChain.bundle(function (data) {
    var sink = data[sinkName];
    Attachment.attach(sink, data.popup);
    Positioning.position(sink, data.anchor, data.popup);
    return Result.value(data);
  });
};

var cTestPopupInSink = function (label, sinkName) {
  return Chain.control(
    NamedChain.bundle(function (data) {
      var sink = data[sinkName];
      var inside = Sinks.isInside(sink, data.popup);
      return inside ? Result.value(data) : Result.error(
        new Error('The popup does not appear within the ' + label + ' sink container')
      );
    }),
    Guard.tryUntil('Ensuring that the popup is inside the ' + label + ' sink', 100, 3000)
  );
};

var cScrollTo = Chain.mapper(function (component) {
  component.element().dom().scrollIntoView();
  var doc = Traverse.owner(component.element());
  return Scroll.get(doc);
});

var cAddTopMargin = function (amount) {
  return Chain.mapper(function (component) {
    Css.set(component.element(), 'margin-top', amount);
    return component;
  });
};

var cTestSink = function (label, sinkName) {
  return ChainUtils.cLogging(
    label,
    [
      cAddPopupToSink(sinkName),
      cTestPopupInSink(sinkName, sinkName)
    ]
  );
};

var cScrollDown = function (componentName, amount) {
  return ChainUtils.cLogging(
    'Adding margin to ' + componentName + ' and scrolling to it',
    [
      NamedChain.direct(componentName, cAddTopMargin(amount), '_'),
      NamedChain.direct(componentName, cScrollTo, '_')
    ]
  );
};

export default <any> {
  cTestSink: cTestSink,
  cScrollDown: cScrollDown
};