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

// TODO: Is this really the best way to move focus out of the input when it gets disabled #TINY-11527
export const focusParent = (comp: AlloyComponent): void =>
  Focus.search(comp.element).each((focus) => {
    SelectorFind.ancestor<HTMLElement>(focus, '[tabindex="-1"]').each((parent) => {
      Focus.focus(parent);
    });
  });

