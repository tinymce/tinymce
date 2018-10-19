import { FieldSchema, Objects } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';

import { SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';
import * as ButtonBase from '../../ui/common/ButtonBase';
import { ButtonDetail, ButtonSketcher, ButtonSpec } from '../../ui/types/ButtonTypes';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { SketchBehaviours } from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';

const factory: SingleSketchFactory<ButtonDetail, ButtonSpec> = (detail): SketchSpec => {
  const events = ButtonBase.events(detail.action);

  const optTag = Objects.readOptFrom(detail.dom, 'tag');

  const getModAttributes = () => {
    if (optTag.is('button')) {
      // Ignore type, but set role if if isn't the normal role
      return detail.role.fold(
        () => ({ }),
        (role: string) => ({ role })
      );
    } else {
      // They can override role, but not type. At the moment.
      const role = detail.role.getOr('button');
      return {
        type: 'button',
        role
      };
    }
  }

  return {
    uid: detail.uid,
    dom: detail.dom,
    components: detail.components,
    events,
    behaviours: SketchBehaviours.augment(
      detail.buttonBehaviours, [
        Focusing.config({ }),
        Keying.config({
          mode: 'execution',
          // Note execution will capture keyup when the focus is on the button
          // on Firefox, because otherwise it will fire a click event and double
          // up on the action
          useSpace: true,
          useEnter: true
        })
      ]
    ),
    domModification: {
      attributes: getModAttributes()
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
