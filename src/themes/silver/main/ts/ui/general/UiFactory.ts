import { AlloySpec, SimpleOrSketchSpec } from '@ephox/alloy';
import { FormParts } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/FormTypes';
import { Objects } from '@ephox/boulder';
import { Fun, Merger } from '@ephox/katamari';
import { renderAlertBanner } from 'tinymce/themes/silver/ui/general/AlertBanner';

import { BridgedType, UiFactoryBackstage } from '../../backstage/Backstage';
import { renderAutocomplete } from '../dialog/Autocomplete';
import { renderColorInput } from '../dialog/ColorInput';
import { renderColorPicker } from '../dialog/ColorPicker';
import { renderCustomEditor } from '../dialog/CustomEditor';
import { renderDropZone } from '../dialog/Dropzone';
import { renderGrid } from '../dialog/Grid';
import { renderIFrame } from '../dialog/IFrame';
import { renderImageTools } from '../dialog/imagetools/ImageTools';
import { renderSelectBox } from '../dialog/SelectBox';
import { renderSizeInput } from '../dialog/SizeInput';
import { renderInput, renderTextarea } from '../dialog/TextField';
import { renderUrlInput } from '../dialog/UrlInput';
import { renderDialogButton } from './Button';
import { renderCheckbox } from './Checkbox';
import { renderHtmlPanel } from './HtmlPanel';
import { renderListbox } from './Listbox';
import { renderUiLabel } from './UiLabel';
import { renderCollection } from '../dialog/Collection';

// tslint:disable:no-console

export type FormPartRenderer = (parts: FormParts, spec: BridgedType, backstage: UiFactoryBackstage) => AlloySpec;
export type NoFormRenderer = (spec: BridgedType, backstage: UiFactoryBackstage) => AlloySpec;

const make = function (render: NoFormRenderer): FormPartRenderer {
  return (parts, spec, backstage) => {
    return Objects.readOptFrom(spec, 'name').fold(
      () => render(spec, backstage),
      (fieldName) => parts.field(fieldName, render(spec, backstage) as SimpleOrSketchSpec)
    );
  };
};

const makeIframe = (render: NoFormRenderer): FormPartRenderer => {
  return (parts, spec, backstage) => {
    const iframeSpec = Merger.deepMerge(spec, {
      source: 'dynamic'
    });
    return make(render)(parts, iframeSpec, backstage);
  };
};

const factories: Record<string, FormPartRenderer> = {
  collection: make((spec, backstage) => renderCollection(spec, backstage.shared)),
  alloy: make(Fun.identity),
  alertbanner: make((spec, backstage) => renderAlertBanner(spec, backstage.shared.providers)),
  input: make((spec, backstage) => renderInput(spec, backstage.shared)),
  textarea: make((spec, backstage) => renderTextarea(spec, backstage.shared)),
  // textbutton: make(Buttons.text().sketch),
  // iconbutton: make(Buttons.icon().sketch),
  listbox: make((spec, backstage) => renderListbox(spec, backstage.shared)),
  label: make((spec, backstage) => renderUiLabel(spec, backstage.shared)),
  iframe: makeIframe((spec, backstage) => renderIFrame(spec, backstage.shared)),
  autocomplete: make((spec, backstage) => renderAutocomplete(spec, backstage.shared)),
  button: make((spec, backstage) => renderDialogButton(spec, backstage.shared)),
  checkbox: make((spec, backstage) => renderCheckbox(spec, backstage.shared.providers)),
  colorinput: make((spec, backstage) => renderColorInput(spec, backstage.shared, backstage.colorinput)),
  colorpicker: make(renderColorPicker), // Not sure if this needs name.
  dropzone: make((spec, backstage) => renderDropZone(spec, backstage.shared)),
  grid: make((spec, backstage) => renderGrid(spec, backstage.shared)),
  selectbox: make((spec, backstage) => renderSelectBox(spec, backstage.shared)),
  sizeinput: make((spec, backstage) => renderSizeInput(spec, backstage.shared)),
  urlinput: make((spec, backstage) => {
    return renderUrlInput(
      spec, backstage.shared, backstage.urlinput
    );
  }),
  customeditor: make(renderCustomEditor),
  htmlpanel: make(renderHtmlPanel),
  imagetools: make((spec, backstage) => renderImageTools(spec, backstage.shared))
};

const noFormParts: any = {
  field: (_name, spec) => spec
};

const interpretInForm = (parts, spec, oldBackstage) => {
  // Now, we need to update the backstage to use the parts variant.
  const newBackstage = Merger.deepMerge(
    oldBackstage,
    {
      // Add the interpreter based on the form parts.
      shared: {
        interpreter: (childSpec) => {
          return interpretParts(parts, childSpec, newBackstage);
        }
      }
    }
  );

  return interpretParts(parts, spec, newBackstage);
};

const interpretParts: FormPartRenderer = (parts, spec, backstage) => {
  return Objects.readOptFrom(factories, spec.type).fold(
    () => {
      console.error(`Unknown factory type "${spec.type}", defaulting to container: `, spec);
      return spec as AlloySpec;
    },
    (factory: FormPartRenderer) => {
      return factory(parts, spec, backstage);
    }
  );
};

const interpretWithoutForm: NoFormRenderer = (spec, backstage: UiFactoryBackstage) => {
  const parts = noFormParts;
  return interpretParts(parts, spec, backstage);
};

export { interpretInForm, interpretWithoutForm };
