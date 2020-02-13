import { FieldSchema } from '@ephox/boulder';
import { Obj } from '@ephox/katamari';

import { SketchSpec } from '../../api/component/SpecTypes';
import * as ButtonBase from '../../ui/common/ButtonBase';
import { ButtonDetail, ButtonSketcher, ButtonSpec } from '../../ui/types/ButtonTypes';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { SketchBehaviours } from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { SingleSketchFactory } from './UiSketcher';

const factory: SingleSketchFactory<ButtonDetail, ButtonSpec> = (detail): SketchSpec => {
  const events = ButtonBase.events(detail.action);

  const tag = detail.dom.tag;

  const lookupAttr = (attr: string) => {
    return Obj.get(detail.dom, 'attributes').bind((attrs) => {
      return Obj.get(attrs, attr);
    });
  };

  // Button tags should not have a default role of button, and only buttons should
  // get a type of button.
  const getModAttributes = (): Record<string, string | number | boolean> => {
    if (tag === 'button') {
      // Default to type button, unless specified otherwise
      const type = lookupAttr('type').getOr('button');
      // Only use a role if it is specified
      const roleAttrs = lookupAttr('role').map(
        (role): Record<string, string | number | boolean> => ({ role })
      ).getOr({ });

      return {
        type,
        ...roleAttrs
      };
    } else {
      // We are not a button, so type is irrelevant (unless specified)
      // Default role to button
      const role = lookupAttr('role').getOr('button');
      return { role };
    }
  };

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

const Button: ButtonSketcher = Sketcher.single({
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
});

export {
  Button
};
