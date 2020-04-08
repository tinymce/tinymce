import { SketchSpec } from '../../api/component/SpecTypes';
import * as InputBase from '../../ui/common/InputBase';
import { InputDetail, InputSketcher, InputSpec } from '../../ui/types/InputTypes';
import * as Sketcher from './Sketcher';
import { SingleSketchFactory } from './UiSketcher';

const factory: SingleSketchFactory<InputDetail, InputSpec> = (detail, _spec): SketchSpec => ({
  uid: detail.uid,
  dom: InputBase.dom(detail),
  // No children.
  components: [ ],
  behaviours: InputBase.behaviours(detail),
  eventOrder: detail.eventOrder
});

const Input: InputSketcher = Sketcher.single({
  name: 'Input',
  configFields: InputBase.schema(),
  factory
});

export {
  Input
};
