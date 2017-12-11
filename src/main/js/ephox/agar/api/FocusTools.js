import SizzleFind from '../alien/SizzleFind';
import Truncate from '../alien/Truncate';
import Chain from './Chain';
import Guard from './Guard';
import Logger from './Logger';
import UiControls from './UiControls';
import UiFinder from './UiFinder';
import Waiter from './Waiter';
import { Result } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Focus } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';

var cGetFocused = Chain.binder(function (doc) {
  return Focus.active(doc).fold(function () {
    return Result.error('Could not find active element');
  }, function (active) {
    return Result.value(active);
  });
});

var cSetFocused = Chain.mapper(function (element) {
  Focus.focus(element);
  return element;
});

var cGetOwnerDoc = Chain.mapper(Traverse.owner);


var sIsOn = function (label, element) {
  return Chain.asStep(element, [
    cGetOwnerDoc,
    cGetFocused,
    Chain.binder(function (active) {
      return Compare.eq(element, active) ? Result.value(active) : Result.error(
        label + '\nExpected focus: ' + Truncate.getHtml(element) + '\nActual focus: ' + Truncate.getHtml(active)
      );
    })
  ]);
};

var sIsOnSelector = function (label, doc, selector) {
  return Chain.asStep(doc, [
    cGetFocused,
    Chain.binder(function (active) {
      return SizzleFind.matches(active, selector) ? Result.value(active) :  Result.error(
        label + '\nExpected focus $("' + selector + '")]\nActual focus: ' + Truncate.getHtml(active)
      );
    })
  ]);
};

var sTryOnSelector = function (label, doc, selector) {
  return Logger.t(
    label + '. Focus did not match: ' + selector,
    Waiter.sTryUntil(
      'Waiting for focus',
      sIsOnSelector(label, doc, selector),
      100, 4000
    )
  );
};

var cSetFocus = function (label, selector) {
  // Input: container
  return Chain.fromChains([
    Chain.control(
      UiFinder.cFindIn(selector),
      Guard.addLogging(label)
    ),
    cSetFocused
  ]);
};

var cSetActiveValue = function (newValue) {
  // Input: container
  return Chain.fromChains([
    cGetOwnerDoc,
    cGetFocused,
    UiControls.cSetValue(newValue)
  ]);
};

// Input: container
var cGetActiveValue = Chain.fromChains([
  cGetOwnerDoc,
  cGetFocused,
  UiControls.cGetValue
]);

var sSetFocus = function (label, container, selector) {
  return Chain.asStep(container, [ cSetFocus(label, selector) ]);
};

var sSetActiveValue = function (doc, newValue) {
  return Chain.asStep(doc, [
    cGetFocused,
    UiControls.cSetValue(newValue)
  ]);
};

export default <any> {
  sSetActiveValue: sSetActiveValue,
  sSetFocus: sSetFocus,
  sIsOn: sIsOn,
  sIsOnSelector: sIsOnSelector,
  sTryOnSelector: sTryOnSelector,

  cSetFocus: cSetFocus,
  cSetActiveValue: cSetActiveValue,
  cGetActiveValue: cGetActiveValue,
  cGetFocused: cGetFocused
};