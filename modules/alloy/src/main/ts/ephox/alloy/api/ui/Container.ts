import { FieldSchema } from '@ephox/boulder';

import { ContainerDetail, ContainerSketcher, ContainerSpec } from '../../ui/types/ContainerTypes';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { SketchSpec } from '../component/SpecTypes';
import * as Sketcher from './Sketcher';
import { SingleSketchFactory } from './UiSketcher';

const factory: SingleSketchFactory<ContainerDetail, ContainerSpec> = (detail): SketchSpec => {
  const { attributes, ...domWithoutAttributes } = detail.dom;
  return {
    uid: detail.uid,
    dom: {
      tag: 'div',
      attributes: {
        role: 'presentation',
        ...attributes
      },
      ...domWithoutAttributes
    },
    components: detail.components,
    behaviours: SketchBehaviours.get(detail.containerBehaviours),
    events: detail.events,
    domModification: detail.domModification,
    eventOrder: detail.eventOrder
  };
};

const Container: ContainerSketcher = Sketcher.single({
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
