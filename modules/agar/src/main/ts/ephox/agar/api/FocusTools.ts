import { Result } from '@ephox/katamari';
import { Compare, Element, Focus, Traverse, Truncate } from '@ephox/sugar';

import * as SizzleFind from '../alien/SizzleFind';
import { Chain } from './Chain';
import * as Guard from './Guard';
import * as Logger from './Logger';
import * as UiControls from './UiControls';
import * as UiFinder from './UiFinder';
import * as Waiter from './Waiter';
import { Step } from './Step';
import { Document, Node } from '@ephox/dom-globals';

const cGetFocused: Chain<Element<any>, Element<any>> =
  Chain.binder((doc) =>
    Focus.active(doc).fold(
      () => Result.error('Could not find active element'),
      Result.value)
  );

const cSetFocused: Chain<Element<any>, Element<any>> =
  Chain.op(Focus.focus);

const cGetOwnerDoc: Chain<Element<Node>, Element<Document>> =
  Chain.mapper(Traverse.owner);

const sIsOn = <T>(label: string, element: Element<any>): Step<T, T> =>
  Chain.asStep<T, Element>(element, [
    cGetOwnerDoc,
    cGetFocused,
    Chain.binder((active: Element<any>): Result<Element, string> =>
      Compare.eq(element, active) ? Result.value(active) : Result.error(
        label + '\nExpected focus: ' + Truncate.getHtml(element) + '\nActual focus: ' + Truncate.getHtml(active)
      ))
  ]);

const sIsOnSelector = <T>(label: string, doc: Element<any>, selector: string): Step<T, T> =>
  Logger.t(
    `${label}: sIsOnSelector(${selector})`,
    Chain.asStep<T, Element>(doc, [
      cGetFocused,
      Chain.binder((active: Element<any>): Result<Element, string> =>
        SizzleFind.matches(active, selector) ? Result.value(active) : Result.error(
          label + '\nExpected focus $("' + selector + '")]\nActual focus: ' + Truncate.getHtml(active)
        ))
    ])
  );

const sTryOnSelector = <T>(label: string, doc: Element<any>, selector: string): Step<T, T> =>
  Logger.t<T, T>(
    label + '. Focus did not match: ' + selector,
    Waiter.sTryUntil(
      'Waiting for focus',
      sIsOnSelector(label, doc, selector),
      10, 4000
    )
  );

const cSetFocus = (label: string, selector: string): Chain<Element, Element> => {
  // Input: container
  return Chain.fromChains([
    Chain.control<Element, Element, Element>(
      UiFinder.cFindIn(selector),
      Guard.addLogging(label)
    ),
    cSetFocused
  ]);
};

const cSetActiveValue = (newValue: string): Chain<Element, Element> => {
  // Input: container
  return Chain.fromChains([
    cGetOwnerDoc,
    cGetFocused,
    UiControls.cSetValue(newValue)
  ]);
};

// Input: container
const cGetActiveValue: Chain<Element, string> =
  Chain.fromChains([
    cGetOwnerDoc,
    cGetFocused,
    UiControls.cGetValue
  ]);

const sSetFocus = <T>(label: string, container: Element<any>, selector: string): Step<T, T> =>
  Chain.asStep<T, Element>(container, [cSetFocus(label, selector)]);

const sSetActiveValue = <T>(doc: Element<any>, newValue: string): Step<T, T> =>
  Chain.asStep<T, Element>(doc, [
    cGetFocused,
    UiControls.cSetValue(newValue)
  ]);

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
