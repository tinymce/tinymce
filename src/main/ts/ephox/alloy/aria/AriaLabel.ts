import { Attr } from '@ephox/sugar';
import { Option, Id, Fun } from '@ephox/katamari';

export default {
  labelledBy(labelledElement, labelElement) {
    const labelId = Option.from(Attr.get(labelledElement, 'id'))
      .fold(() => {
        const id = Id.generate('dialog-label');
        Attr.set(labelElement, 'id', id);
        return id;
      }, Fun.identity);

    Attr.set(labelledElement, 'aria-labelledby', labelId);
  }
};
