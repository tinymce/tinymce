import { Behaviour, FormField as AlloyFormField, HtmlSelect, SketchSpec, Tabstopping } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import { renderFormField, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';

// I think this was from before bridge. I don't think it is used.
export const renderListbox = (spec: ListboxFoo): SketchSpec => {
  const pLabel = renderLabel(spec.label);

  const pField = AlloyFormField.parts().field({
    factory: HtmlSelect,
    dom: {
      classes: [ 'mce-select-field' ]
    },
    selectBehaviours: Behaviour.derive([
      Tabstopping.config({ })
    ]),
    options: spec.values,
    // FIX: Don't use undefined here.
    data: spec.initialValue.getOr(undefined)
  });

  return renderFormField(Option.some(pLabel), pField);
};

export interface ListboxFoo {
  name: string;
  label: string; // Probably make option like the rest.
  values: Array<{value: string, text: string}>;
  // Probably needs to come through form API
  initialValue: Option<string>;
}