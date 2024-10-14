import {
  AlloyComponent,
  InlineView,
  Keying
} from '@ephox/alloy';
import { Focus, SelectorFind } from '@ephox/sugar';

const contextFormInputSelector = '.tox-toolbar-slider__input,.tox-toolbar-textfield';

export const focusIn = (contextbar: AlloyComponent): void => {
  InlineView.getContent(contextbar).each((comp) => {
    SelectorFind.descendant<HTMLInputElement>(comp.element, contextFormInputSelector).fold(
      () => Keying.focusIn(comp),
      Focus.focus
    );
  });
};
