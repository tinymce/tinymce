const createAccordion = (
  { open = true, summary = 'Accordion summary...', body = '<p>Accordion body...</p>' }:
  { open?: boolean; summary?: string; body?: string } = {}): string =>
  `<details class="mce-accordion"${open ? ` open="open"` : ''}><summary class="mce-accordion-summary">${summary}</summary>${body}</details>`;

export {
  createAccordion
};
