import { Result } from '@ephox/katamari';
import { Compare, Focus, SugarElement, SugarShadowDom, Truncate } from '@ephox/sugar';

import * as SizzleFind from '../alien/SizzleFind';
import { Chain } from './Chain';
import * as Guard from './Guard';
import * as Logger from './Logger';
import { Step } from './Step';
import * as UiControls from './UiControls';
import * as UiFinder from './UiFinder';
import * as Waiter from './Waiter';

const getFocused = <T extends HTMLElement>(doc: SugarElement<Document | ShadowRoot>): Result<SugarElement<T>, string> => {
  return Focus.active<T>(doc).fold(
    () => Result.error('Could not find active element'),
    Result.value
  );
};

const getActiveValue = (element: SugarElement<Node>): string | undefined => {
  const doc = SugarShadowDom.getRootNode(element);
  const focused = getFocused(doc).getOrDie();
  return UiControls.getValue(focused as SugarElement<any>);
};

const setFocus = <T extends HTMLElement>(container: SugarElement<Node>, selector: string): SugarElement<T> => {
  const elem = UiFinder.findIn<T>(container, selector).getOrDie();
  Focus.focus(elem);
  return elem;
};

const setActiveValue = (doc: SugarElement<Document | ShadowRoot>, newValue: string): SugarElement<HTMLElement> => {
  const focused = getFocused(doc).getOrDie();
  UiControls.setValue(focused as SugarElement<any>, newValue);
  return focused;
};

const isOn = (label: string, element: SugarElement<Node>): SugarElement<HTMLElement> => {
  const doc = SugarShadowDom.getRootNode(element);
  return getFocused(doc).bind((active) => {
    return Compare.eq(element, active) ? Result.value(active) : Result.error(
      label + '\nExpected focus: ' + Truncate.getHtml(element) + '\nActual focus: ' + Truncate.getHtml(active)
    );
  }).getOrDie();
};

const isOnSelector = (label: string, doc: SugarElement<Document | ShadowRoot>, selector: string): SugarElement<HTMLElement> => {
  return getFocused(doc).bind((active) => {
    return SizzleFind.matches(active, selector) ? Result.value(active) : Result.error(
      label + '\nExpected focus $("' + selector + '")]\nActual focus: ' + Truncate.getHtml(active)
    );
  }).getOrDie();
};

const cGetFocused: Chain<SugarElement<Document | ShadowRoot>, SugarElement<HTMLElement>> =
  Chain.binder(getFocused);

const cGetRootNode: Chain<SugarElement<Node>, SugarElement<Document | ShadowRoot>> =
  Chain.mapper(SugarShadowDom.getRootNode);

const wrapInResult = <R>(f: () => R) => (): Result<R, string> => {
  try {
    return Result.value(f());
  } catch (e) {
    return Result.error(e.message);
  }
};

const sIsOn = <T>(label: string, element: SugarElement<Node>): Step<T, T> =>
  Chain.asStep<T, SugarElement<Node>>(element, [
    Chain.binder(wrapInResult(() => isOn(label, element)))
  ]);

const sIsOnSelector = <T>(label: string, doc: SugarElement<Document | ShadowRoot>, selector: string): Step<T, T> =>
  Logger.t(
    `${label}: sIsOnSelector(${selector})`,
    Chain.asStep<T, SugarElement<Document | ShadowRoot>>(doc, [
      Chain.binder(wrapInResult(() => isOnSelector(label, doc, selector)))
    ])
  );

const sTryOnSelector = <T>(label: string, doc: SugarElement<Document | ShadowRoot>, selector: string): Step<T, T> =>
  Logger.t<T, T>(
    label + '. Focus did not match: ' + selector,
    Waiter.sTryUntil(
      'Waiting for focus',
      sIsOnSelector(label, doc, selector),
      10, 4000
    )
  );

const pTryOnSelector = (label: string, doc: SugarElement<Document | ShadowRoot>, selector: string): Promise<SugarElement<HTMLElement>> =>
  Waiter.pTryUntil(label + '. Focus did not match: ' + selector, () => isOnSelector(label, doc, selector));

const cSetFocus = <T extends Node, U extends HTMLElement>(label: string, selector: string): Chain<SugarElement<T>, SugarElement<U>> =>
  // Input: container
  Chain.control(
    Chain.mapper((container) => setFocus<U>(container, selector)),
    Guard.addLogging(label)
  );

const cSetActiveValue = (newValue: string): Chain<SugarElement<Node>, SugarElement<HTMLElement>> =>
  // Input: container
  Chain.fromChains([
    cGetRootNode,
    Chain.mapper((root) => setActiveValue(root, newValue))
  ]);

// Input: container
const cGetActiveValue: Chain<SugarElement<Node>, string> =
  Chain.fromChains([
    cGetRootNode,
    cGetFocused,
    UiControls.cGetValue
  ]);

const sSetFocus = <T>(label: string, container: SugarElement<Node>, selector: string): Step<T, T> =>
  Chain.asStep<T, SugarElement<Node>>(container, [ cSetFocus(label, selector) ]);

const sSetActiveValue = <T>(doc: SugarElement<Document | ShadowRoot>, newValue: string): Step<T, T> =>
  Step.sync(() => setActiveValue(doc, newValue));

export {
  getActiveValue,
  setActiveValue,
  setFocus,
  getFocused,
  isOn,
  isOnSelector,

  pTryOnSelector,

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
