const namedAnchorSelector = 'a:not([href])';

const isEmptyString = (str: string): boolean => !str;

const getIdFromAnchor = (elm: HTMLAnchorElement): string => {
  const id = elm.getAttribute('id') || elm.getAttribute('name');
  return id || '';
};

const isAnchor = (elm: Node | null): elm is HTMLAnchorElement =>
  elm && elm.nodeName.toLowerCase() === 'a';

const isNamedAnchor = (elm: Node | null): elm is HTMLAnchorElement =>
  isAnchor(elm) && !elm.getAttribute('href') && getIdFromAnchor(elm) !== '';

const isEmptyNamedAnchor = (elm: Node | null): elm is HTMLAnchorElement =>
  isNamedAnchor(elm) && !elm.firstChild;

export {
  namedAnchorSelector,
  isEmptyString,
  getIdFromAnchor,
  isNamedAnchor,
  isEmptyNamedAnchor
};
