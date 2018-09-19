import { Objects, FieldSchema } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';

import * as ButtonBase from '../../ui/common/ButtonBase';
import * as Behaviour from '../behaviour/Behaviour';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import { ButtonDetail, ButtonSketcher, ButtonSpec } from '../../ui/types/ButtonTypes';
import { SingleSketchFactory } from '../../api/ui/UiSketcher';
import { PlatformDetection } from '@ephox/sand';

const isFirefox: boolean = PlatformDetection.detect().browser.isFirefox();

const factory: SingleSketchFactory<ButtonDetail, ButtonSpec> = (detail): SketchSpec => {
  const events = ButtonBase.events(detail.action());

  const optType = Objects.readOptFrom(detail.dom(), 'attributes').bind(Objects.readOpt('type'));
  const optTag = Objects.readOptFrom(detail.dom(), 'tag');

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: detail.components(),
    events,
    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Focusing.config({ }),
        Keying.config({
          mode: 'execution',
          // On Firefox, pressing space fires a click event. We could potentially resolve this
          // by listening to keyup instead of keydown, but that seems like a big change. Alternatively,
          // we could make execution be able to do that.
          useSpace: true, //!(isFirefox && optTag.is('button')),
          useEnter: true
        })
      ]),
      SketchBehaviours.get(detail.buttonBehaviours())
    ),
    domModification: {
      attributes: Merger.deepMerge(
        optType.fold(() => {
          return optTag.is('button') ? { type: 'button' } : { };
        }, (t) => {
          return { };
        }),
        {
          role: detail.role().getOr('button')
        }
      )
    },
    eventOrder: detail.eventOrder()
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
