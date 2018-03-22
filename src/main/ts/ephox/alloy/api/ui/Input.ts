import * as InputBase from '../../ui/common/InputBase';
import * as Sketcher from './Sketcher';

const factory = function (detail, spec) {
  return {
    uid: detail.uid(),
    dom: InputBase.dom(detail),
    // No children.
    components: [ ],
    behaviours: InputBase.behaviours(detail),
    eventOrder: detail.eventOrder()
  };
};

const Input = Sketcher.single({
  name: 'Input',
  configFields: InputBase.schema(),
  factory
});

export {
  Input
};