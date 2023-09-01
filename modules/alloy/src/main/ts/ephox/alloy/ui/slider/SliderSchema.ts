import { FieldProcessor, FieldSchema, StructureSchema } from '@ephox/boulder';
import { Cell, Fun } from '@ephox/katamari';

import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as HorizontalModel from './HorizontalModel';
import * as TwoDModel from './TwoDModel';
import * as VerticalModel from './VerticalModel';

interface SliderModelSpec {
  mode: {
    minX: number;
    minY: number;
  };
}

const SliderSchema: FieldProcessor[] = [
  FieldSchema.defaulted('stepSize', 1),
  FieldSchema.defaulted('speedMultiplier', 10),
  FieldSchema.defaulted('onChange', Fun.noop),
  FieldSchema.defaulted('onChoose', Fun.noop),
  FieldSchema.defaulted('onInit', Fun.noop),
  FieldSchema.defaulted('onDragStart', Fun.noop),
  FieldSchema.defaulted('onDragEnd', Fun.noop),
  FieldSchema.defaulted('snapToGrid', false),
  FieldSchema.defaulted('rounded', true),
  FieldSchema.option('snapStart'),
  FieldSchema.requiredOf('model', StructureSchema.choose(
    'mode',
    {
      x: [
        FieldSchema.defaulted('minX', 0),
        FieldSchema.defaulted('maxX', 100),
        FieldSchema.customField('value', (spec: SliderModelSpec) => Cell(spec.mode.minX)),
        FieldSchema.required('getInitialValue'),
        Fields.output('manager', HorizontalModel)
      ],
      y: [
        FieldSchema.defaulted('minY', 0),
        FieldSchema.defaulted('maxY', 100),
        FieldSchema.customField('value', (spec: SliderModelSpec) => Cell(spec.mode.minY)),
        FieldSchema.required('getInitialValue'),
        Fields.output('manager', VerticalModel)
      ],
      xy: [
        FieldSchema.defaulted('minX', 0),
        FieldSchema.defaulted('maxX', 100),
        FieldSchema.defaulted('minY', 0),
        FieldSchema.defaulted('maxY', 100),
        FieldSchema.customField('value', (spec: SliderModelSpec) => Cell({
          x: spec.mode.minX,
          y: spec.mode.minY
        })),
        FieldSchema.required('getInitialValue'),
        Fields.output('manager', TwoDModel)
      ]
    }
  )),

  SketchBehaviours.field('sliderBehaviours', [ Keying, Representing ]),
  FieldSchema.customField('mouseIsDown', () => Cell(false))
];

export {
  SliderSchema
};
