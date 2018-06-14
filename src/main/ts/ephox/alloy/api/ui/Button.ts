import { Objects, FieldSchema } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';

import * as ButtonBase from '../../ui/common/ButtonBase';
import * as Behaviour from '../behaviour/Behaviour';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import { ButtonDetail, ButtonSketcher } from 'ephox/alloy/ui/types/ButtonTypes';

const factory = function (detail: ButtonDetail): SketchSpec {
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
          useSpace: true,
          useEnter: true
        })
      ]),
      SketchBehaviours.get(detail.buttonBehaviours())
    ),
    domModification: {
      attributes: Merger.deepMerge(
        optType.fold(function () {
          return optTag.is('button') ? { type: 'button' } : { };
        }, function (t) {
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
