import { Id } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

import * as AlloyParts from '../../parts/AlloyParts';
import * as FormFieldSchema from '../../ui/schema/FormFieldSchema';
import { FormFieldApis, FormFieldDetail, FormFieldSketcher, FormFieldSpec } from '../../ui/types/FormFieldTypes';
import { Composing } from '../behaviour/Composing';
import { Representing } from '../behaviour/Representing';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { SketchSpec } from '../component/SpecTypes';
import * as AlloyEvents from '../events/AlloyEvents';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<FormFieldDetail, FormFieldSpec> = (detail, components, _spec, _externals): SketchSpec => {
  const behaviours = SketchBehaviours.augment(
    detail.fieldBehaviours,
    [
      Composing.config({
        find: (container) => {
          return AlloyParts.getPart(container, detail, 'field');
        }
      }),

      Representing.config({
        store: {
          mode: 'manual',
          getValue: (field) => {
            return Composing.getCurrent(field).bind(Representing.getValue);
          },
          setValue: (field, value) => {
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
    AlloyEvents.runOnAttached((component, _simulatedEvent) => {
      const ps = AlloyParts.getParts(component, detail, [ 'label', 'field', 'aria-descriptor' ]);
      ps.field().each((field) => {
        const id = Id.generate(detail.prefix);
        ps.label().each((label) => {
          // TODO: Find a nicer way of doing this.
          Attribute.set(label.element, 'for', id);
          Attribute.set(field.element, 'id', id);
        });

        ps['aria-descriptor']().each((descriptor) => {
          const descriptorId = Id.generate(detail.prefix);
          Attribute.set(descriptor.element, 'id', descriptorId);
          Attribute.set(field.element, 'aria-describedby', descriptorId);
        });
      });
    })
  ]);

  const apis = {
    getField: (container: AlloyComponent) => AlloyParts.getPart(container, detail, 'field'),
    getLabel: (container: AlloyComponent) =>
      // TODO: Use constants for part names
      AlloyParts.getPart(container, detail, 'label')

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

const FormField: FormFieldSketcher = Sketcher.composite<FormFieldSpec, FormFieldDetail, FormFieldApis>({
  name: 'FormField',
  configFields: FormFieldSchema.schema(),
  partFields: FormFieldSchema.parts(),
  factory,
  apis: {
    getField: (apis, comp) => apis.getField(comp),
    getLabel: (apis, comp) => apis.getLabel(comp)
  }
});

export {
  FormField
};
