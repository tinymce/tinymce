import Behaviour from '../behaviour/Behaviour';
import Composing from '../behaviour/Composing';
import Representing from '../behaviour/Representing';
import SketchBehaviours from '../component/SketchBehaviours';
import AlloyEvents from '../events/AlloyEvents';
import Sketcher from './Sketcher';
import AlloyParts from '../../parts/AlloyParts';
import FormFieldSchema from '../../ui/schema/FormFieldSchema';
import { Id } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

var factory = function (detail, components, spec, externals) {
  var behaviours = Merger.deepMerge(
    Behaviour.derive([
      Composing.config({
        find: function (container) {
          return AlloyParts.getPart(container, detail, 'field');
        }
      }),

      Representing.config({
        store: {
          mode: 'manual',
          getValue: function (field) {
            return Composing.getCurrent(field).bind(Representing.getValue);
          },
          setValue: function (field, value) {
            Composing.getCurrent(field).each(function (current) {
              Representing.setValue(current, value);
            });
          }
        }
      })
    ]),
    SketchBehaviours.get(detail.fieldBehaviours())
  );

  var events = AlloyEvents.derive([
    // Used to be systemInit
    AlloyEvents.runOnAttached(function (component, simulatedEvent) {
      var ps = AlloyParts.getParts(component, detail, [ 'label', 'field' ]);
      ps.label().each(function (label) {
        ps.field().each(function (field) {
          var id = Id.generate(detail.prefix());

          // TODO: Find a nicer way of doing this.
          Attr.set(label.element(), 'for', id);
          Attr.set(field.element(), 'id', id);
        });
      });
    })
  ]);

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: components,
    behaviours: behaviours,
    events: events
  };
};

export default <any> Sketcher.composite({
  name: 'FormField',
  configFields: FormFieldSchema.schema(),
  partFields: FormFieldSchema.parts(),
  factory: factory
});