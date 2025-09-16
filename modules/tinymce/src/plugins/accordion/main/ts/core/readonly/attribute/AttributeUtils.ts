import { accordionTemporaryOpenAttribute } from '../../Identifiers';

export interface AttributeOperationAdapter<T> {
  setAttribute: (element: T, name: string, value: string) => void;
  hasAttribute: (element: T, name: string) => boolean;
  getAttribute: (element: T, name: string) => string | undefined;
  removeAttribute: (element: T, name: string) => void;
};

const addTemporaryAttributes = <T>(adapter: Pick<AttributeOperationAdapter<T>, 'setAttribute' | 'hasAttribute'>, detailsElement: T): void => {
  const { setAttribute, hasAttribute } = adapter;
  setAttribute(detailsElement, accordionTemporaryOpenAttribute, hasAttribute(detailsElement, 'open') ? 'true' : 'false');
};

const restoreNormalState = <T>(adapter: AttributeOperationAdapter<T>, detailsElement: T): void => {
  const { setAttribute, hasAttribute, getAttribute, removeAttribute } = adapter;
  // At this point every <details> should have data-mce-open attribute. But I will ignore those that don't - just in case.
  if (!hasAttribute(detailsElement, accordionTemporaryOpenAttribute)) {
    return;
  }
  const mceOpen = getAttribute(detailsElement, accordionTemporaryOpenAttribute)?.toLowerCase() === 'true';
  removeAttribute(detailsElement, accordionTemporaryOpenAttribute);
  if (mceOpen) {
    setAttribute(detailsElement, 'open', 'open');
  } else {
    removeAttribute(detailsElement, 'open');
  }
};

export {
  addTemporaryAttributes,
  restoreNormalState
};
