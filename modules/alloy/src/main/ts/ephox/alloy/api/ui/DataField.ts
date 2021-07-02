import { FieldSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import { DataFieldDetail, DataFieldSketcher, DataFieldSpec } from '../../ui/types/DataFieldTypes';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import { SketchBehaviours } from '../component/SketchBehaviours';
import { SketchSpec } from '../component/SpecTypes';
import * as AlloyEvents from '../events/AlloyEvents';
import * as Sketcher from './Sketcher';
import { SingleSketchFactory } from './UiSketcher';

const factory: SingleSketchFactory<DataFieldDetail, DataFieldSpec> = (detail): SketchSpec => ({
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
        find: Optional.some
      })
    ]
  ),
  events: AlloyEvents.derive([
    AlloyEvents.runOnAttached((component, _simulatedEvent) => {
      Representing.setValue(component, detail.getInitialValue());
    })
  ])
});

const DataField: DataFieldSketcher = Sketcher.single({
  name: 'DataField',
  factory,
  configFields: [
    FieldSchema.required('uid'),
    FieldSchema.required('dom'),
    FieldSchema.required('getInitialValue'),
    SketchBehaviours.field('dataBehaviours', [ Representing, Composing ])
  ]
});

export {
  DataField
};
