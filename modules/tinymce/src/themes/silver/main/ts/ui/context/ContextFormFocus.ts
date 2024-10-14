import {
  AlloyComponent,
  InlineView,
  Keying
} from '@ephox/alloy';
import { Focus, SelectorFind } from '@ephox/sugar';

export const focusInputIn = (contextbar: AlloyComponent): void => {
  InlineView.getContent(contextbar).each((comp) => {
    SelectorFind.descendant<HTMLInputElement>(comp.element, 'input').fold(
      () => Keying.focusIn(comp),
      Focus.focus
    );
  });
};
