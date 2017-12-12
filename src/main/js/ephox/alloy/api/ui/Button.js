import Behaviour from '../behaviour/Behaviour';
import Focusing from '../behaviour/Focusing';
import Keying from '../behaviour/Keying';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';
import Fields from '../../data/Fields';
import ButtonBase from '../../ui/common/ButtonBase';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';

var factory = function (detail, spec) {
  var events = ButtonBase.events(detail.action());

  var optType = Objects.readOptFrom(detail.dom(), 'attributes').bind(Objects.readOpt('type'));
  var optTag = Objects.readOptFrom(detail.dom(), 'tag');

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: detail.components(),
    events: events,
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

export default <any> Sketcher.single({
  name: 'Button',
  factory: factory,
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