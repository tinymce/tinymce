import { Attr } from '@ephox/sugar';
import { Option, Id, Fun } from '@ephox/katamari';

export default {
  describedBy(describedElement, describeElement) {
    const describeId = Option.from(Attr.get(describedElement, 'id'))
      .fold(() => {
        const id = Id.generate('dialog-describe');
        Attr.set(describeElement, 'id', id);
        return id;
      }, Fun.identity);

    Attr.set(describedElement, 'aria-describedby', describeId);
  }
};
