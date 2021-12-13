import { Fun, Id } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';

export const labelledBy = (labelledElement: SugarElement<Element>, labelElement: SugarElement<Element>): void => {
  const labelId = Attribute.getOpt(labelledElement, 'id')
    .fold(() => {
      const id = Id.generate('dialog-label');
      Attribute.set(labelElement, 'id', id);
      return id;
    }, Fun.identity);

  Attribute.set(labelledElement, 'aria-labelledby', labelId);
};
