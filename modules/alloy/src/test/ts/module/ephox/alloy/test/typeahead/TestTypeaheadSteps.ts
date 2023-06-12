import { Assertions, Chain, FocusTools, Logger, Step, UiFinder, Waiter } from '@ephox/agar';
import { Attribute, SugarElement, Value } from '@ephox/sugar';

import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import { GuiSystem } from 'ephox/alloy/api/system/Gui';

interface TestTypeaheadSteps {
  readonly sWaitForMenu: <T>(label: string) => Step<T, T>;
  readonly sWaitForNoMenu: <T>(label: string) => Step<T, T>;
  readonly sAssertTextSelection: <T>(label: string, start: number, finish: number) => Step<T, T>;
  readonly sAssertFocusOnTypeahead: <T>(label: string) => Step<T, T>;
  readonly sTriggerInputEvent: <T>(label: string) => Step<T, T>;
  readonly sAssertValue: <T>(label: string, expected: string) => Step<T, T>;
  readonly sAssertAriaActiveDescendant: <T>(label: string, expected: string) => Step<T, T>;
}

export default (doc: SugarElement<HTMLDocument>, gui: GuiSystem, typeahead: AlloyComponent): TestTypeaheadSteps => {
  const sWaitForMenu = <T>(label: string) => Logger.t<T, T>(
    label,
    Waiter.sTryUntil(
      'Waiting for menu to appear',
      UiFinder.sExists(gui.element, '.selected-menu'),
      100,
      4000
    )
  );

  const sAssertTextSelection = <T>(label: string, start: number, finish: number) => Logger.t<T, T>(
    label + ' sAssertTextSelection',
    Step.sync(() => {
      const node = typeahead.element.dom as HTMLInputElement;
      Assertions.assertEq(label + ' start cursor', start, node.selectionStart);
      Assertions.assertEq(label + ' finish cursor', finish, node.selectionEnd);
    })
  );

  const sTriggerInputEvent = <T>(label: string) => Logger.t<T, T>(
    label + ' sTriggerInputEvent',
    Step.sync(() => {
      AlloyTriggers.emit(typeahead, NativeEvents.input());
    })
  );

  const sWaitForNoMenu = <T>(label: string) => Logger.t<T, T>(
    label,
    Waiter.sTryUntil(
      'Waiting for menu to go away',
      UiFinder.sNotExists(gui.element, '.selected-menu'),
      100,
      1000
    )
  );

  const sAssertFocusOnTypeahead = <T>(label: string) => Logger.t<T, T>(
    label,
    FocusTools.sTryOnSelector(
      'Focus should be on typeahead',
      doc,
      'input'
    )
  );

  const sAssertValue = <T>(label: string, expected: string) => Logger.t<T, T>(
    label + ' sAssertValue',
    Chain.asStep(typeahead.element, [
      Chain.mapper(Value.get),
      Assertions.cAssertEq('Checking value of typeahead', expected)
    ])
  );

  const sAssertAriaActiveDescendant = <T>(label: string, expected: string) => Logger.t<T, T>(
    label + ' sAssertAriaActiveDescendant',
    Chain.asStep(typeahead.element, [
      Chain.mapper((input) => Attribute.getOpt(input, 'aria-activedescendant').getOr('')),
      Assertions.cAssertEq('Checking aria-activedescendant of typeahead', expected)
    ])
  );

  return {
    sWaitForMenu,
    sWaitForNoMenu,
    sAssertTextSelection,
    sAssertFocusOnTypeahead,
    sTriggerInputEvent,
    sAssertValue,
    sAssertAriaActiveDescendant
  };
};
