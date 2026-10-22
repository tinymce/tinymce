import { UiFinder } from '@ephox/agar';
import { TinyDom } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

interface AccordionDetails {
  readonly open?: boolean;
  readonly summary?: string;
  readonly body?: string;
}

const createAccordion = (details: AccordionDetails = {}, withoutEmptySpace: boolean = false): string => {
  const {
    open = true,
    summary = 'Accordion summary&hellip;',
    body = '<p>Accordion body&hellip;</p>'
  } = details;
  return `<details class="mce-accordion"${open ? ` open="open"` : ''}><summary>${summary}</summary>${body}</details>${withoutEmptySpace ? '' : '<p>&nbsp;</p>'}`;
};

// toggle is dispatched in a task of its own after the open attribute changes
const pOpenAccordionByAttribute = async (editor: Editor): Promise<void> => {
  const details = UiFinder.findIn<HTMLDetailsElement>(TinyDom.body(editor), 'details').getOrDie().dom;
  const pToggled = new Promise<void>((resolve) => details.addEventListener('toggle', () => resolve(), { once: true }));
  details.setAttribute('open', 'open');
  await pToggled;
};

export {
  createAccordion,
  pOpenAccordionByAttribute
};
