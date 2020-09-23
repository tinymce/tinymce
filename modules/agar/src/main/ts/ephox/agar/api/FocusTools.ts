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

const cGetFocused: Chain<SugarElement<any>, SugarElement<any>> =
  Chain.binder((doc) =>
    Focus.active(doc).fold(
      () => Result.error('Could not find active element'),
      Result.value)
  );

const cSetFocused: Chain<SugarElement<any>, SugarElement<any>> =
  Chain.op(Focus.focus);

const cGetRootNode: Chain<SugarElement<Node>, SugarElement<Document | ShadowRoot>> =
  Chain.mapper(SugarShadowDom.getRootNode);

const sIsOn = <T>(label: string, element: SugarElement<any>): Step<T, T> =>
  Chain.asStep<T, SugarElement>(element, [
    cGetRootNode,
    cGetFocused,
    Chain.binder((active: SugarElement<any>): Result<SugarElement, string> =>
      Compare.eq(element, active) ? Result.value(active) : Result.error(
        label + '\nExpected focus: ' + Truncate.getHtml(element) + '\nActual focus: ' + Truncate.getHtml(active)
      ))
  ]);

const sIsOnSelector = <T>(label: string, doc: SugarElement<any>, selector: string): Step<T, T> =>
  Logger.t(
    `${label}: sIsOnSelector(${selector})`,
    Chain.asStep<T, SugarElement>(doc, [
      cGetFocused,
      Chain.binder((active: SugarElement<any>): Result<SugarElement, string> =>
        SizzleFind.matches(active, selector) ? Result.value(active) : Result.error(
          label + '\nExpected focus $("' + selector + '")]\nActual focus: ' + Truncate.getHtml(active)
        ))
    ])
  );

const sTryOnSelector = <T>(label: string, doc: SugarElement<any>, selector: string): Step<T, T> =>
  Logger.t<T, T>(
    label + '. Focus did not match: ' + selector,
    Waiter.sTryUntil(
      'Waiting for focus',
      sIsOnSelector(label, doc, selector),
      10, 4000
    )
  );

const cSetFocus = (label: string, selector: string): Chain<SugarElement, SugarElement> =>
  // Input: container
  Chain.fromChains([
    Chain.control<SugarElement, SugarElement, SugarElement>(
      UiFinder.cFindIn(selector),
      Guard.addLogging(label)
    ),
    cSetFocused
  ]);

const cSetActiveValue = (newValue: string): Chain<SugarElement, SugarElement> =>
  // Input: container
  Chain.fromChains([
    cGetRootNode,
    cGetFocused,
    UiControls.cSetValue(newValue)
  ]);

// Input: container
const cGetActiveValue: Chain<SugarElement, string> =
  Chain.fromChains([
    cGetRootNode,
    cGetFocused,
    UiControls.cGetValue
  ]);

const sSetFocus = <T>(label: string, container: SugarElement<any>, selector: string): Step<T, T> =>
  Chain.asStep<T, SugarElement>(container, [ cSetFocus(label, selector) ]);

const sSetActiveValue = <T>(doc: SugarElement<any>, newValue: string): Step<T, T> =>
  Chain.asStep<T, SugarElement>(doc, [
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
