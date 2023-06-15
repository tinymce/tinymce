interface AccordionDetails {
  readonly open?: boolean;
  readonly summary?: string;
  readonly body?: string;
}

const createAccordion = (details: AccordionDetails = {}): string => {
  const {
    open = true,
    summary = 'Accordion summary...',
    body = '<p>Accordion body...</p>\n'
  } = details;
  return `<details class="mce-accordion"${open ? ` open="open"` : ''}>\n<summary>${summary}</summary>\n${body}</details>`;
};

export {
  createAccordion
};
