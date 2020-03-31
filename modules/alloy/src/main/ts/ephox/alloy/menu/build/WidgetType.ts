import { FieldSchema } from '@ephox/boulder';
import { Option } from '@ephox/katamari';

import * as EditableFields from '../../alien/EditableFields';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as Fields from '../../data/Fields';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ItemEvents from '../util/ItemEvents';
import * as WidgetParts from './WidgetParts';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { WidgetItemDetail } from '../../ui/types/ItemTypes';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';

const builder = (detail: WidgetItemDetail) => {
  const subs = AlloyParts.substitutes(WidgetParts.owner(), detail, WidgetParts.parts());
  const components = AlloyParts.components(WidgetParts.owner(), detail, subs.internals());

  const focusWidget = (component: AlloyComponent) => AlloyParts.getPart(component, detail, 'widget').map((widget) => {
    Keying.focusIn(widget);
    return widget;
  });

  const onHorizontalArrow = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent): Option<boolean> => EditableFields.inside(simulatedEvent.event().target()) ? Option.none<boolean>() : (() => {
    if (detail.autofocus) {
      simulatedEvent.setSource(component.element());
      return Option.none<boolean>();
    } else {
      return Option.none<boolean>();
    }
  })();

  return {
    dom: detail.dom,
    components,
    domModification: detail.domModification,
    events: AlloyEvents.derive([
      AlloyEvents.runOnExecute((component, simulatedEvent) => {
        focusWidget(component).each((_widget) => {
          simulatedEvent.stop();
        });
      }),

      AlloyEvents.run(NativeEvents.mouseover(), ItemEvents.onHover),

      AlloyEvents.run(SystemEvents.focusItem(), (component, _simulatedEvent) => {
        if (detail.autofocus) { focusWidget(component); } else { Focusing.focus(component); }
      })
    ]),
    behaviours: SketchBehaviours.augment(
      detail.widgetBehaviours,
      [
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: detail.data
          }
        }),
        Focusing.config({
          ignore: detail.ignoreFocus,
          // What about stopMousedown from ItemType?
          onFocus(component) {
            ItemEvents.onFocus(component);
          }
        }),
        Keying.config({
          mode: 'special',
          // This is required as long as Highlighting tries to focus the first thing (after focusItem fires)
          focusIn: detail.autofocus ? (component) => {
            focusWidget(component);
          } : Behaviour.revoke(),
          onLeft: onHorizontalArrow,
          onRight: onHorizontalArrow,
          onEscape(component, simulatedEvent) {
            // If the outer list item didn't have focus,
            // then focus it (i.e. escape the inner widget). Only do if not autofocusing
            // Autofocusing should treat the widget like it is the only item, so it should
            // let its outer menu handle escape
            if (! Focusing.isFocused(component) && !detail.autofocus) {
              Focusing.focus(component);
              return Option.some<boolean>(true);
            } else if (detail.autofocus) {
              simulatedEvent.setSource(component.element());
              return Option.none<boolean>();
            } else {
              return Option.none<boolean>();
            }
          }
        })
      ]
    )
  };
};

const schema = [
  FieldSchema.strict('uid'),
  FieldSchema.strict('data'),
  FieldSchema.strict('components'),
  FieldSchema.strict('dom'),
  FieldSchema.defaulted('autofocus', false),
  FieldSchema.defaulted('ignoreFocus', false),

  SketchBehaviours.field('widgetBehaviours', [ Representing, Focusing, Keying ]),
  FieldSchema.defaulted('domModification', { }),
  // We don't have the uid at this point
  AlloyParts.defaultUidsSchema(WidgetParts.parts()),
  Fields.output('builder', builder)
];

export default schema;
