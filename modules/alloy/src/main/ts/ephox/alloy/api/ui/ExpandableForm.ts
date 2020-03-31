import { SketchSpec } from '../../api/component/SpecTypes';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ExpandableFormSchema from '../../ui/schema/ExpandableFormSchema';
import { ExpandableFormApis, ExpandableFormDetail, ExpandableFormSketcher, ExpandableFormSpec } from '../../ui/types/ExpandableFormTypes';
import { Representing } from '../behaviour/Representing';
import { Sliding } from '../behaviour/Sliding';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { Form } from './Form';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const runOnExtra = (detail: ExpandableFormDetail, operation: (comp: AlloyComponent) => void) => (anyComp: AlloyComponent) => {
  AlloyParts.getPart(anyComp, detail, 'extra').each(operation);
};

const factory: CompositeSketchFactory<ExpandableFormDetail, ExpandableFormSpec> = (detail, components, _spec, _externals): SketchSpec => {
  const getParts = (form: AlloyComponent) => AlloyParts.getPartsOrDie(form, detail, [ 'minimal', 'extra' ]);

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,

    behaviours: SketchBehaviours.augment(
      detail.expandableBehaviours,
      [
        Representing.config({
          store: {
            mode: 'manual',
            getValue(form) {
              const parts = getParts(form);
              const minimalValues = Representing.getValue(parts.minimal());
              const extraValues = Representing.getValue(parts.extra());
              return { ...minimalValues, ...extraValues };
            },
            setValue(form, values) {
              const parts = getParts(form);
              // ASSUMPTION: Form ignore values that it does not have.
              Representing.setValue(parts.minimal(), values);
              Representing.setValue(parts.extra(), values);
            }
          }
        })
      ]
    ),

    apis: {
      toggleForm: runOnExtra(detail, Sliding.toggleGrow),
      collapseForm: runOnExtra(detail, Sliding.shrink),
      collapseFormImmediately: runOnExtra(detail, Sliding.immediateShrink),
      expandForm: runOnExtra(detail, Sliding.grow),
      getField(form: AlloyComponent, key: string) {
        return AlloyParts.getPart(form, detail, 'minimal').bind((minimal) => Form.getField(minimal, key)).orThunk(() => AlloyParts.getPart(form, detail, 'extra').bind((extra) => Form.getField(extra, key)));
      }
    }
  };

};

const ExpandableForm: ExpandableFormSketcher = Sketcher.composite<ExpandableFormSpec, ExpandableFormDetail, ExpandableFormApis>({
  name: 'ExpandableForm',
  configFields: ExpandableFormSchema.schema(),
  partFields: ExpandableFormSchema.parts(),
  factory,
  apis: {
    getField: (apis, component, key) => apis.getField(component, key),
    toggleForm: (apis, component) => {
      apis.toggleForm(component);
    },
    collapseForm: (apis, component) => {
      apis.collapseForm(component);
    },
    collapseFormImmediately: (apis, component) => {
      apis.collapseFormImmediately(component);
    },
    expandForm: (apis, component) => {
      apis.expandForm(component);
    }
  }
});

export {
  ExpandableForm
};
