import { Id, Merger } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';

import * as AlloyParts from '../../parts/AlloyParts';
import * as FormFieldSchema from '../../ui/schema/FormFieldSchema';
import * as Behaviour from '../behaviour/Behaviour';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as Sketcher from './Sketcher';

const factory = function (detail, components, spec, externals) {
  const behaviours = Merger.deepMerge(
    Behaviour.derive([
      Composing.config({
        find (container) {
          return AlloyParts.getPart(container, detail, 'field');
        }
      }),

      Representing.config({
        store: {
          mode: 'manual',
          getValue (field) {
            return Composing.getCurrent(field).bind(Representing.getValue);
          },
          setValue (field, value) {
            Composing.getCurrent(field).each(function (current) {
              Representing.setValue(current, value);
            });
          }
        }
      })
    ]),
    SketchBehaviours.get(detail.fieldBehaviours())
  );

  const events = AlloyEvents.derive([
    // Used to be systemInit
    AlloyEvents.runOnAttached(function (component, simulatedEvent) {
      const ps = AlloyParts.getParts(component, detail, [ 'label', 'field' ]);
      ps.label().each(function (label) {
        ps.field().each(function (field) {
          const id = Id.generate(detail.prefix());

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
    components,
    behaviours,
    events
  };
};

export default <any> Sketcher.composite({
  name: 'FormField',
  configFields: FormFieldSchema.schema(),
  partFields: FormFieldSchema.parts(),
  factory
});