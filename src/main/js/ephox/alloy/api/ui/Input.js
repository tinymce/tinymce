import Sketcher from './Sketcher';
import InputBase from '../../ui/common/InputBase';

var factory = function (detail, spec) {
  return {
    uid: detail.uid(),
    dom: InputBase.dom(detail),
    // No children.
    components: [ ],
    behaviours: InputBase.behaviours(detail),
    eventOrder: detail.eventOrder()
  };
};

export default <any> Sketcher.single({
  name: 'Input',
  configFields: InputBase.schema(),
  factory: factory
});