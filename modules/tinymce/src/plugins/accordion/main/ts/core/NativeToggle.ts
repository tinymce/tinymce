import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

import * as Identifiers from './Identifiers';
import * as Utils from './Utils';

const isAccordion = (target: EventTarget | null): target is HTMLDetailsElement => {
  const node = target as Node | null;
  return Utils.isDetails(node) && node.classList.contains(Identifiers.accordionDetailsClass);
};

const setup = (editor: Editor): void => {
  const onToggle = (e: Event) => {
    const details = e.target;
    if (isAccordion(details) && !editor.readonly && !Options.isDisabled(editor)) {
      details.setAttribute(Identifiers.accordionReadonlyCompensationAttribute, Utils.isOpen(details) ? 'open' : 'closed');
    }
  };

  editor.on('init', () => {
    const body = editor.getBody();
    // toggle does not bubble, so it is caught in the capture phase
    body.addEventListener('toggle', onToggle, true);
    editor.on('remove', () => body.removeEventListener('toggle', onToggle, true));
  });
};

export {
  setup
};
