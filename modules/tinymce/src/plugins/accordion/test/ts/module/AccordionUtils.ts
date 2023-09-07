interface AccordionDetails {
  readonly open?: boolean;
  readonly summary?: string;
  readonly body?: string;
}

const createAccordion = (details: AccordionDetails = {}): string => {
  const {
    open = true,
    summary = 'Accordion summary...',
    body = '<p>Accordion body...</p>'
  } = details;
  return `<details class="mce-accordion"${open ? ` open="open"` : ''}><summary>${summary}</summary>${body}</details>`;
};

export {
  createAccordion
};
