import Behaviour from '../behaviour/Behaviour';
import Composing from '../behaviour/Composing';
import Representing from '../behaviour/Representing';
import Sliding from '../behaviour/Sliding';
import SketchBehaviours from '../component/SketchBehaviours';
import Form from './Form';
import Sketcher from './Sketcher';
import AlloyParts from '../../parts/AlloyParts';
import ExpandableFormSchema from '../../ui/schema/ExpandableFormSchema';
import { Merger } from '@ephox/katamari';

var runOnExtra = function (detail, operation) {
  return function (anyComp) {
    AlloyParts.getPart(anyComp, detail, 'extra').each(operation);
  };
};

var factory = function (detail, components, spec, _externals) {
  var getParts = function (form) {
    return AlloyParts.getPartsOrDie(form, detail, [ 'minimal', 'extra' ]);
  };

  return {
    uid: detail.uid(),
    dom: detail.dom(),
    components: components,

    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Representing.config({
          store: {
            mode: 'manual',
            getValue: function (form) {
              var parts = getParts(form);
              var minimalValues = Representing.getValue(parts.minimal());
              var extraValues = Representing.getValue(parts.extra());
              return Merger.deepMerge(
                minimalValues,
                extraValues
              );
            },
            setValue: function (form, values) {
              var parts = getParts(form);
              // ASSUMPTION: Form ignore values that it does not have.
              Representing.setValue(parts.minimal(), values);
              Representing.setValue(parts.extra(), values);
            }
          }
        })
      ]),
      SketchBehaviours.get(detail.expandableBehaviours())
    ),

    apis: {
      toggleForm: runOnExtra(detail, Sliding.toggleGrow),
      collapseForm: runOnExtra(detail, Sliding.shrink),
      collapseFormImmediately: runOnExtra(detail, Sliding.immediateShrink),
      expandForm: runOnExtra(detail, Sliding.grow),
      getField: function (form, key) {
        return AlloyParts.getPart(form, detail, 'minimal').bind(function (minimal) {
          return Form.getField(minimal, key);
        }).orThunk(function () {
          return AlloyParts.getPart(form, detail, 'extra').bind(function (extra) {
            return Form.getField(extra, key);
          });
        });
      }
    }
  };

};

export default <any> Sketcher.composite({
  name: 'ExpandableForm',
  configFields: ExpandableFormSchema.schema(),
  partFields: ExpandableFormSchema.parts(),
  factory: factory,
  apis: {
    getField: function (apis, component, key) {
      return apis.getField(component, key);
    },
    toggleForm: function (apis, component) {
      apis.toggleForm(component);
    },
    collapseForm: function (apis, component) {
      apis.collapseForm(component);
    },
    collapseFormImmediately: function (apis, component) {
      apis.collapseFormImmediately(component);
    },
    expandForm: function (apis, component) {
      apis.expandForm(component);
    }
  }
});