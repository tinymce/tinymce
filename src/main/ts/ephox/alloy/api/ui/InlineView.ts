import ComponentStructure from '../../alien/ComponentStructure';
import Behaviour from '../behaviour/Behaviour';
import Positioning from '../behaviour/Positioning';
import Receiving from '../behaviour/Receiving';
import Sandboxing from '../behaviour/Sandboxing';
import SketchBehaviours from '../component/SketchBehaviours';
import Sketcher from './Sketcher';
import Fields from '../../data/Fields';
import Dismissal from '../../sandbox/Dismissal';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var factory = function (detail, spec) {
  var isPartOfRelated = function (container, queryElem) {
    var related = detail.getRelated()(container);
    return related.exists(function (rel) {
      return ComponentStructure.isPartOf(rel, queryElem);
    });
  };

  return Merger.deepMerge(
    {
      uid: detail.uid(),
      dom: detail.dom(),
      behaviours: Merger.deepMerge(
        Behaviour.derive([
          Sandboxing.config({
            isPartOf: function (container, data, queryElem) {
              return ComponentStructure.isPartOf(data, queryElem) || isPartOfRelated(container, queryElem);
            },
            getAttachPoint: function () {
              return detail.lazySink()().getOrDie();
            }
          }),
          Dismissal.receivingConfig({
            isExtraPart: Fun.constant(false)
          })
        ]),
        SketchBehaviours.get(detail.inlineBehaviours())
      ),
      eventOrder: detail.eventOrder(),

      apis: {
        showAt: function (sandbox, anchor, thing) {
          var sink = detail.lazySink()().getOrDie();
          Sandboxing.cloak(sandbox);
          Sandboxing.open(sandbox, thing);
          Positioning.position(sink, anchor, sandbox);
          Sandboxing.decloak(sandbox);
          detail.onShow()(sandbox);
        },
        hide: function (sandbox) {
          Sandboxing.close(sandbox);
          detail.onHide()(sandbox);
        },
        isOpen: Sandboxing.isOpen
      }
    }
  );
};

export default <any> Sketcher.single({
  name: 'InlineView',
  configFields: [
    FieldSchema.strict('lazySink'),
    Fields.onHandler('onShow'),
    Fields.onHandler('onHide'),
    SketchBehaviours.field('inlineBehaviours', [ Sandboxing, Receiving ]),
    FieldSchema.defaulted('getRelated', Option.none),
    FieldSchema.defaulted('eventOrder')
  ],
  factory: factory,
  apis: {
    showAt: function (apis, component, anchor, thing) {
      apis.showAt(component, anchor, thing);
    },
    hide: function (apis, component) {
      apis.hide(component);
    },
    isOpen: function (apis, component) {
      return apis.isOpen(component);
    }
  }
});