import * as InputBase from '../../ui/common/InputBase';
import * as Sketcher from './Sketcher';
import { SketchSpec } from '../../api/component/SpecTypes';
import { InputSketcher, InputDetail, InputSpec } from '../../ui/types/InputTypes';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';

const factory: SingleSketchFactory<InputDetail, InputSpec> = (detail, spec): SketchSpec => {
  return {
    uid: detail.uid,
    dom: InputBase.dom(detail),
    // No children.
    components: [ ],
    behaviours: InputBase.behaviours(detail),
    eventOrder: detail.eventOrder
  };
};

const Input = Sketcher.single({
  name: 'Input',
  configFields: InputBase.schema(),
  factory
}) as InputSketcher;

export {
  Input
};