const namedAnchorSelector = 'a:not([href])';

const isEmptyString = (str: string | undefined): boolean => !str;

const getIdFromAnchor = (elm: HTMLAnchorElement): string => {
  const id = elm.getAttribute('id') || elm.getAttribute('name');
  return id || '';
};

const isAnchor = (elm: Node): elm is HTMLAnchorElement =>
  elm.nodeName.toLowerCase() === 'a';

const isNamedAnchor = (elm: Node): elm is HTMLAnchorElement =>
  isAnchor(elm) && !elm.getAttribute('href') && getIdFromAnchor(elm) !== '';

const isEmptyNamedAnchor = (elm: Node): elm is HTMLAnchorElement =>
  isNamedAnchor(elm) && !elm.firstChild;

export {
  namedAnchorSelector,
  isEmptyString,
  getIdFromAnchor,
  isNamedAnchor,
  isEmptyNamedAnchor
};
