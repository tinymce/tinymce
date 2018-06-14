import { FieldSchema } from '@ephox/boulder';
import { Merger, Option } from '@ephox/katamari';
import { DataFieldDetail, DataFieldSketcher } from 'ephox/alloy/ui/types/DataFieldTypes';

import { SketchSpec } from '../../api/component/SpecTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as Sketcher from './Sketcher';

const factory = function (detail: DataFieldDetail): SketchSpec {
  return {
    uid: detail.uid(),
    dom: detail.dom(),
    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: detail.getInitialValue()()
          }
        }),
        Composing.config({
          find: Option.some
        })
      ]),
      SketchBehaviours.get(detail.dataBehaviours())
    ),
    events: AlloyEvents.derive([
      AlloyEvents.runOnAttached(function (component, simulatedEvent) {
        Representing.setValue(component, detail.getInitialValue()());
      })
    ])
  };
};

const DataField = Sketcher.single({
  name: 'DataField',
  factory,
  configFields: [
    FieldSchema.strict('uid'),
    FieldSchema.strict('dom'),
    FieldSchema.strict('getInitialValue'),
    SketchBehaviours.field('dataBehaviours', [ Representing, Composing ])
  ]
}) as DataFieldSketcher;

export {
  DataField
};