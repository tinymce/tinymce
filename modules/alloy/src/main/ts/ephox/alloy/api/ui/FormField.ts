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
import { SketchSpec } from '../../api/component/SpecTypes';
import { FormFieldDetail, FormFieldSketcher, FormFieldSpec } from '../../ui/types/FormFieldTypes';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import { AlloyComponent } from '../../api/component/ComponentApi';

const factory: CompositeSketchFactory<FormFieldDetail, FormFieldSpec> = (detail, components, spec, externals): SketchSpec => {
  const behaviours = SketchBehaviours.augment(
    detail.fieldBehaviours,
    [
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
            Composing.getCurrent(field).each((current) => {
              Representing.setValue(current, value);
            });
          }
        }
      })
    ]
  );

  const events = AlloyEvents.derive([
    // Used to be systemInit
    AlloyEvents.runOnAttached((component, simulatedEvent) => {
      const ps = AlloyParts.getParts(component, detail, [ 'label', 'field', 'aria-descriptor' ]);
      ps.field().each((field) => {
        const id = Id.generate(detail.prefix);
        ps.label().each((label) => {
          // TODO: Find a nicer way of doing this.
          Attr.set(label.element(), 'for', id);
          Attr.set(field.element(), 'id', id);
        });

        ps['aria-descriptor']().each((descriptor) => {
          const descriptorId = Id.generate(detail.prefix);
          Attr.set(descriptor.element(), 'id', descriptorId);
          Attr.set(field.element(), 'aria-describedby', descriptorId);
        });
      });
    })
  ]);

  const apis = {
    getField: (container: AlloyComponent) => {
      return AlloyParts.getPart(container, detail, 'field');
    },
    getLabel: (container: AlloyComponent) => {
      // TODO: Use constants for part names
      return AlloyParts.getPart(container, detail, 'label');
    }
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    behaviours,
    events,
    apis
  };
};

const FormField =  Sketcher.composite({
  name: 'FormField',
  configFields: FormFieldSchema.schema(),
  partFields: FormFieldSchema.parts(),
  factory,
  apis: {
    getField: (apis, comp) => apis.getField(comp),
    getLabel: (apis, comp) => apis.getLabel(comp)
  }
}) as FormFieldSketcher;

export {
  FormField
};