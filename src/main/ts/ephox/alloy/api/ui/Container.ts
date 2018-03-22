import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import * as Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';

const factory = function (detail, spec) {
  return {
    uid: detail.uid(),
    dom: Merger.deepMerge(
      {
        tag: 'div',
        attributes: {
          role: 'presentation'
        }
      },
      detail.dom()
    ),
    components: detail.components(),
    behaviours: SketchBehaviours.get(detail.containerBehaviours()),
    events: detail.events(),
    domModification: detail.domModification(),
    eventOrder: detail.eventOrder()
  };
};

const Container = Sketcher.single({
  name: 'Container',
  factory,
  configFields: [
    FieldSchema.defaulted('components', [ ]),
    SketchBehaviours.field('containerBehaviours', [ ]),
    // TODO: Deprecate
    FieldSchema.defaulted('events', { }),
    FieldSchema.defaulted('domModification', { }),
    FieldSchema.defaulted('eventOrder', { })
  ]
});

export {
  Container
};