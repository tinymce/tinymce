import { Fun, Id, Option } from '@ephox/katamari';
import { Attr, Element } from '@ephox/sugar';

const describedBy = (describedElement: Element, describeElement: Element) => {
  const describeId = Option.from(Attr.get(describedElement, 'id'))
    .fold(() => {
      const id = Id.generate('dialog-describe');
      Attr.set(describeElement, 'id', id);
      return id;
    }, Fun.identity);

  Attr.set(describedElement, 'aria-describedby', describeId);
};

export {
  describedBy
};
