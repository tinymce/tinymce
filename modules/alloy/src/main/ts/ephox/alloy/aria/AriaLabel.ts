import { Fun, Id, Option } from '@ephox/katamari';
import { Attr, Element } from '@ephox/sugar';

export default {
  labelledBy(labelledElement: Element, labelElement: Element) {
    const labelId = Option.from(Attr.get(labelledElement, 'id'))
      .fold(() => {
        const id = Id.generate('dialog-label');
        Attr.set(labelElement, 'id', id);
        return id;
      }, Fun.identity);

    Attr.set(labelledElement, 'aria-labelledby', labelId);
  }
};
