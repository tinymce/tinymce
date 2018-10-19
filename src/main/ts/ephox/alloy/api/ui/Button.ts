import { FieldSchema, Objects } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';

import { SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';
import * as ButtonBase from '../../ui/common/ButtonBase';
import { ButtonDetail, ButtonSketcher, ButtonSpec } from '../../ui/types/ButtonTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';

const factory: SingleSketchFactory<ButtonDetail, ButtonSpec> = (detail): SketchSpec => {
  const events = ButtonBase.events(detail.action);

  const optType = Objects.readOptFrom(detail.dom, 'attributes').bind(Objects.readOpt('type'));
  const optTag = Objects.readOptFrom(detail.dom, 'tag');

  return {
    uid: detail.uid,
    dom: detail.dom,
    components: detail.components,
    events,
    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Focusing.config({ }),
        Keying.config({
          mode: 'execution',
          // Note execution will capture keyup when the focus is on the button
          // on Firefox, because otherwise it will fire a click event and double
          // up on the action
          useSpace: true,
          useEnter: true
        })
      ]),
      SketchBehaviours.get(detail.buttonBehaviours)
    ),
    domModification: {
      attributes: Merger.deepMerge(
        optType.fold(() => {
          return optTag.is('button') ? { type: 'button' } : { };
        }, (t) => {
          return { };
        }),
        {
          role: detail.role.getOr('button')
        }
      )
    },
    eventOrder: detail.eventOrder
  };
};

const Button = Sketcher.single({
  name: 'Button',
  factory,
  configFields: [
    FieldSchema.defaulted('uid', undefined),
    FieldSchema.strict('dom'),
    FieldSchema.defaulted('components', [ ]),
    SketchBehaviours.field('buttonBehaviours', [ Focusing, Keying ]),
    FieldSchema.option('action'),
    FieldSchema.option('role'),
    FieldSchema.defaulted('eventOrder', { })
  ]
}) as ButtonSketcher;

export {
  Button
};
