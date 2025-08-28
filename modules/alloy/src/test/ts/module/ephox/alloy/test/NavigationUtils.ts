import { FocusTools, GeneralSteps, Keyboard, Step, UiFinder, Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

const range = <T, R>(num: number, f: (v: T, i: number) => R[]): R[] => {
  const array = new Array(num);
  return Arr.bind(array, f);
};

const sequence = <T>(doc: SugarElement<Document>, key: number, modifiers: { }, identifiers: Array<{ label: string; selector: string }>): Step<T, T> => {
  const array = range(identifiers.length, (_, i) => [
    Keyboard.sKeydown(doc, key, modifiers),
    FocusTools.sTryOnSelector(
      'Focus should move from ' + (i > 0 ? identifiers[i - 1].label : '(start)') + ' to ' + identifiers[i].label,
      doc,
      identifiers[i].selector
    ),
    Step.wait(0)
  ]);

  return GeneralSteps.sequence(array);
};

// Selector based
const highlights = <T>(container: SugarElement<Node>, key: number, modifiers: { }, identifiers: Array<{ label: string; selector: string }>): Step<T, T> => {
  const array = range(identifiers.length, (_, i) => {
    const msg = 'Highlight should move from ' + (i > 0 ? identifiers[i - 1].label : '(start)') + ' to ' + identifiers[i].label;
    const doc = Traverse.owner(container);
    return [
      Keyboard.sKeydown(doc, key, modifiers),
      Waiter.sTryUntil(
        msg,
        UiFinder.sExists(container, identifiers[i].selector),
        100,
        1000
      ),
      Step.wait(0)
    ];
  });

  return GeneralSteps.sequence(array);
};

export {
  sequence,
  highlights
};
