import { FieldSchema, Objects } from '@ephox/boulder';
import { Merger, Option } from '@ephox/katamari';

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

  const tag = detail.dom.tag;

  const lookupAttr = (attr: string): Option<string> => {
    return Objects.readOptFrom<Record<string, string>>(detail.dom, 'attributes').bind((attrs) => {
      return Objects.readOptFrom<string>(attrs, attr);
    });
  };

  // Button tags should not have a default role of button, and only buttons should
  // get a type of button.
  const getModAttributes = () => {
    if (tag === 'button') {
      // Default to type button, unless specified otherwise
      const type = lookupAttr('type').getOr('button');
      // Only use a role if it is specified
      const roleAttrs = lookupAttr('role').map(
        (role: string) => ({ role } as Record<string, string>)
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
