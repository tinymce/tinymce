import { FieldSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import { SketchSpec } from '../../api/component/SpecTypes';
import { DataFieldDetail, DataFieldSketcher, DataFieldSpec } from '../../ui/types/DataFieldTypes';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import { SketchBehaviours } from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as Sketcher from './Sketcher';
import { SingleSketchFactory } from './UiSketcher';

const factory: SingleSketchFactory<DataFieldDetail, DataFieldSpec> = (detail): SketchSpec => {
  return {
    uid: detail.uid,
    dom: detail.dom,
    behaviours: SketchBehaviours.augment(
      detail.dataBehaviours,
      [
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: detail.getInitialValue()
          }
        }),
        Composing.config({
          find: Option.some
        })
      ]
    ),
    events: AlloyEvents.derive([
      AlloyEvents.runOnAttached((component, simulatedEvent) => {
        Representing.setValue(component, detail.getInitialValue());
      })
    ])
  };
};

const DataField: DataFieldSketcher = Sketcher.single({
  name: 'DataField',
  factory,
  configFields: [
    FieldSchema.strict('uid'),
    FieldSchema.strict('dom'),
    FieldSchema.strict('getInitialValue'),
    SketchBehaviours.field('dataBehaviours', [ Representing, Composing ])
  ]
});

export {
  DataField
};
