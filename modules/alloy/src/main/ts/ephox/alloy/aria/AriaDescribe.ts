import { Fun, Id, Optional } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';

const describedBy = (describedElement: SugarElement<Element>, describeElement: SugarElement<Element>): void => {
  const describeId = Optional.from(Attribute.get(describedElement, 'id'))
    .fold(() => {
      const id = Id.generate('dialog-describe');
      Attribute.set(describeElement, 'id', id);
      return id;
    }, Fun.identity);

  Attribute.set(describedElement, 'aria-describedby', describeId);
};

export {
  describedBy
};
