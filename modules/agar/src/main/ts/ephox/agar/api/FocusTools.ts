import { Result } from '@ephox/katamari';
import { Compare, Element, Focus, Traverse } from '@ephox/sugar';

import * as SizzleFind from '../alien/SizzleFind';
import * as Truncate from '../alien/Truncate';
import { Chain } from './Chain';
import * as Guard from './Guard';
import * as Logger from './Logger';
import * as UiControls from './UiControls';
import * as UiFinder from './UiFinder';
import * as Waiter from './Waiter';
import { Step } from './Step';

const cGetFocused = Chain.binder(function (doc: Element) {
  return Focus.active(doc).fold(function (): Result<Element, string> {
    return Result.error('Could not find active element');
  }, function (active) {
    return Result.value(active);
  });
});

const cSetFocused = Chain.mapper(function (element: Element) {
  Focus.focus(element);
  return element;
});

const cGetOwnerDoc = Chain.mapper(Traverse.owner);

const sIsOn = function <T>(label: string, element: Element): Step<T, T> {
  return Chain.asStep<T, Element>(element, [
    cGetOwnerDoc,
    cGetFocused,
    Chain.binder(function (active: Element): Result<Element, string> {
      return Compare.eq(element, active) ? Result.value(active) : Result.error(
        label + '\nExpected focus: ' + Truncate.getHtml(element) + '\nActual focus: ' + Truncate.getHtml(active)
      );
    })
  ]);
};

const sIsOnSelector = function <T>(label: string, doc: Element, selector: string) {
  return Logger.t(
    `${label}: sIsOnSelector(${selector})`,
    Chain.asStep<T, Element>(doc, [
      cGetFocused,
      Chain.binder(function (active: Element): Result<Element, string> {
        return SizzleFind.matches(active, selector) ? Result.value(active) : Result.error(
          label + '\nExpected focus $("' + selector + '")]\nActual focus: ' + Truncate.getHtml(active)
        );
      })
    ])
  );
};

const sTryOnSelector = function <T>(label: string, doc: Element, selector: string) {
  return Logger.t<T, T>(
    label + '. Focus did not match: ' + selector,
    Waiter.sTryUntil(
      'Waiting for focus',
      sIsOnSelector(label, doc, selector),
      10, 4000
    )
  );
};

const cSetFocus = function (label: string, selector: string): Chain<Element, Element> {
  // Input: container
  return Chain.fromChains([
    Chain.control<Element, Element, Element>(
      UiFinder.cFindIn(selector),
      Guard.addLogging(label)
    ),
    cSetFocused
  ]);
};

const cSetActiveValue = function (newValue: string): Chain<Element, Element> {
  // Input: container
  return Chain.fromChains([
    cGetOwnerDoc,
    cGetFocused,
    UiControls.cSetValue(newValue)
  ]);
};

// Input: container
const cGetActiveValue: Chain<Element, string> = Chain.fromChains([
  cGetOwnerDoc,
  cGetFocused,
  UiControls.cGetValue
]);

const sSetFocus = function <T>(label: string, container: Element, selector: string) {
  return Chain.asStep<T, Element>(container, [cSetFocus(label, selector)]);
};

const sSetActiveValue = function <T>(doc: Element, newValue: string) {
  return Chain.asStep<T, Element>(doc, [
    cGetFocused,
    UiControls.cSetValue(newValue)
  ]);
};

export {
  sSetActiveValue,
  sSetFocus,
  sIsOn,
  sIsOnSelector,
  sTryOnSelector,

  cSetFocus,
  cSetActiveValue,
  cGetActiveValue,
  cGetFocused
};
