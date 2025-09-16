import { Arr } from '@ephox/katamari';

import { accordionTemporaryOpenAttribute } from '../../Identifiers';

export interface AttributeOperationAdapter<T> {
  setAttribute: (element: T, name: string, value: string) => void;
  hasAttribute: (element: T, name: string) => boolean;
  getAttribute: (element: T, name: string) => string | undefined;
  removeAttribute: (element: T, name: string) => void;
};

const addTemporaryAttributes = <T>(adapter: Pick<AttributeOperationAdapter<T>, 'setAttribute' | 'hasAttribute'>, detailsElements: Array<T>): void => {
  const { setAttribute, hasAttribute } = adapter;
  Arr.each(
    detailsElements,
    (details) => setAttribute(details, accordionTemporaryOpenAttribute, hasAttribute(details, 'open') + '')
  );
};

const restoreNormalState = <T>(adapter: AttributeOperationAdapter<T>, detailsElements: Array<T>): void => {
  const { setAttribute, hasAttribute, getAttribute, removeAttribute } = adapter;
  Arr.each(
    // At this point every <details> should have data-mce-open attribute. But I will ignore those that don't - just in case.
    Arr.filter(detailsElements, (e) => hasAttribute(e, accordionTemporaryOpenAttribute)),
    (details) => {
      const mceOpen = getAttribute(details, accordionTemporaryOpenAttribute)?.toLowerCase() === 'true';
      removeAttribute(details, accordionTemporaryOpenAttribute);
      if (mceOpen) {
        setAttribute(details, 'open', 'open');
      } else {
        removeAttribute(details, 'open');
      }
    }
  );
};

export {
  addTemporaryAttributes,
  restoreNormalState
};
