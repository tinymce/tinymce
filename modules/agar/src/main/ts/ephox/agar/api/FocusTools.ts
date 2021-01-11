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

const getFocused = (doc: SugarElement<Document | ShadowRoot>): Result<SugarElement<HTMLElement>, string> => {
  return Focus.active(doc).fold(
    () => Result.error('Could not find active element'),
    Result.value
  );
};

const setFocus = <T extends Element>(container: SugarElement<Node>, selector: string): SugarElement<T> => {
  const elem = UiFinder.findIn(container, selector).getOrDie();
  Focus.focus(elem);
  return elem;
};

const setActiveValue = (doc: SugarElement<Document | ShadowRoot>, newValue: string): SugarElement<HTMLElement> => {
  const focused = getFocused(doc).getOrDie();
  UiControls.setValue(focused as SugarElement<any>, newValue);
  return focused;
};

const isOn = (label: string, element: SugarElement<Node>): Result<SugarElement<HTMLElement>, string> => {
  const doc = SugarShadowDom.getRootNode(element);
  return getFocused(doc).bind((active) => {
    return Compare.eq(element, active) ? Result.value(active) : Result.error(
      label + '\nExpected focus: ' + Truncate.getHtml(element) + '\nActual focus: ' + Truncate.getHtml(active)
    );
  });
};

const isOnSelector = (label: string, doc: SugarElement<Document | ShadowRoot>, selector: string): Result<SugarElement<HTMLElement>, string> => {
  return getFocused(doc).bind((active) => {
    return SizzleFind.matches(active, selector) ? Result.value(active) : Result.error(
      label + '\nExpected focus $("' + selector + '")]\nActual focus: ' + Truncate.getHtml(active)
    );
  });
};

const cGetFocused: Chain<SugarElement<Document | ShadowRoot>, SugarElement<HTMLElement>> =
  Chain.binder(getFocused);

const cGetRootNode: Chain<SugarElement<Node>, SugarElement<Document | ShadowRoot>> =
  Chain.mapper(SugarShadowDom.getRootNode);

const sIsOn = <T>(label: string, element: SugarElement<Node>): Step<T, T> =>
  Chain.asStep<T, SugarElement<Node>>(element, [
    Chain.binder(() => isOn(label, element))
  ]);

const sIsOnSelector = <T>(label: string, doc: SugarElement<Document | ShadowRoot>, selector: string): Step<T, T> =>
  Logger.t(
    `${label}: sIsOnSelector(${selector})`,
    Chain.asStep<T, SugarElement<Document | ShadowRoot>>(doc, [
      Chain.binder(() => isOnSelector(label, doc, selector))
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

const cSetFocus = <T extends Node, U extends Element>(label: string, selector: string): Chain<SugarElement<T>, SugarElement<U>> =>
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
  setActiveValue,
  setFocus,
  isOn,
  isOnSelector,

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
