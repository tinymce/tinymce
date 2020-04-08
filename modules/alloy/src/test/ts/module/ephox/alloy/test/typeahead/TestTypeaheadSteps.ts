import { Assertions, Chain, FocusTools, Logger, Step, UiFinder, Waiter } from '@ephox/agar';
import { HTMLDocument, HTMLInputElement } from '@ephox/dom-globals';
import { Element, Value } from '@ephox/sugar';

import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import { GuiSystem } from 'ephox/alloy/api/system/Gui';

export default (doc: Element<HTMLDocument>, gui: GuiSystem, typeahead: AlloyComponent) => {
  const sWaitForMenu = (label: string) => Logger.t(
    label,
    Waiter.sTryUntil(
      'Waiting for menu to appear',
      UiFinder.sExists(gui.element(), '.selected-menu'),
      100,
      4000
    )
  );

  const sAssertTextSelection = (label: string, start: number, finish: number) => Logger.t(
    label + ' sAssertTextSelection',
    Step.sync(() => {
      const node = typeahead.element().dom() as HTMLInputElement;
      Assertions.assertEq(label + ' start cursor', start, node.selectionStart);
      Assertions.assertEq(label + ' finish cursor', finish, node.selectionEnd);
    })
  );

  const sTriggerInputEvent = (label: string) => Logger.t(
    label + ' sTriggerInputEvent',
    Step.sync(() => {
      AlloyTriggers.emit(typeahead, NativeEvents.input());
    })
  );

  const sWaitForNoMenu = (label: string) => Logger.t(
    label,
    Waiter.sTryUntil(
      'Waiting for menu to go away',
      UiFinder.sNotExists(gui.element(), '.selected-menu'),
      100,
      1000
    )
  );

  const sAssertFocusOnTypeahead = (label: string) => Logger.t(
    label,
    FocusTools.sTryOnSelector(
      'Focus should be on typeahead',
      doc,
      'input'
    )
  );

  const sAssertValue = (label: string, expected: string) => Logger.t(
    label + ' sAssertValue',
    Chain.asStep(typeahead.element(), [
      Chain.mapper(Value.get),
      Assertions.cAssertEq('Checking value of typeahead', expected)
    ])
  );

  return {
    sWaitForMenu,
    sWaitForNoMenu,
    sAssertTextSelection,
    sAssertFocusOnTypeahead,
    sTriggerInputEvent,
    sAssertValue
  };
};
