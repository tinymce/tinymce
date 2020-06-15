/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloySpec, FormTypes, SimpleOrSketchSpec } from '@ephox/alloy';
import { console } from '@ephox/dom-globals';
import { Merger, Obj } from '@ephox/katamari';

import { BridgedType, UiFactoryBackstage } from '../../backstage/Backstage';
import { renderBar } from '../dialog/Bar';
import { renderCollection } from '../dialog/Collection';
import { renderColorInput } from '../dialog/ColorInput';
import { renderColorPicker } from '../dialog/ColorPicker';
import { renderCustomEditor } from '../dialog/CustomEditor';
import { renderDropZone } from '../dialog/Dropzone';
import { renderGrid } from '../dialog/Grid';
import { renderIFrame } from '../dialog/IFrame';
import { renderImageTools } from '../dialog/imagetools/ImageTools';
import { renderLabel } from '../dialog/Label';
import { renderPanel } from '../dialog/Panel';
import { renderSelectBox } from '../dialog/SelectBox';
import { renderSizeInput } from '../dialog/SizeInput';
import { renderTable } from '../dialog/Table';
import { renderInput, renderTextarea } from '../dialog/TextField';
import { renderUrlInput } from '../dialog/UrlInput';
import { renderAlertBanner } from '../general/AlertBanner';
import { renderDialogButton } from './Button';
import { renderCheckbox } from './Checkbox';
import { renderHtmlPanel } from './HtmlPanel';

// tslint:disable:no-console

export type FormPartRenderer = (parts: FormTypes.FormParts, spec: BridgedType, backstage: UiFactoryBackstage) => AlloySpec;
export type NoFormRenderer = (spec: BridgedType, backstage: UiFactoryBackstage) => AlloySpec;

const make = function (render: NoFormRenderer): FormPartRenderer {
  return (parts, spec, backstage) => Obj.get(spec, 'name').fold(
    () => render(spec, backstage),
    (fieldName) => parts.field(fieldName, render(spec, backstage) as SimpleOrSketchSpec)
  );
};

const makeIframe = (render: NoFormRenderer): FormPartRenderer => (parts, spec, backstage) => {
  const iframeSpec = Merger.deepMerge(spec, {
    source: 'dynamic'
  });
  return make(render)(parts, iframeSpec, backstage);
};

const factories: Record<string, FormPartRenderer> = {
  bar: make((spec, backstage) => renderBar(spec, backstage.shared)),
  collection: make((spec, backstage) => renderCollection(spec, backstage.shared.providers)),
  alertbanner: make((spec, backstage) => renderAlertBanner(spec, backstage.shared.providers)),
  input: make((spec, backstage) => renderInput(spec, backstage.shared.providers)),
  textarea: make((spec, backstage) => renderTextarea(spec, backstage.shared.providers)),
  label: make((spec, backstage) => renderLabel(spec, backstage.shared)),
  iframe: makeIframe((spec, backstage) => renderIFrame(spec, backstage.shared.providers)),
  button: make((spec, backstage) => renderDialogButton(spec, backstage.shared.providers)),
  checkbox: make((spec, backstage) => renderCheckbox(spec, backstage.shared.providers)),
  colorinput: make((spec, backstage) => renderColorInput(spec, backstage.shared, backstage.colorinput)),
  colorpicker: make(renderColorPicker), // Not sure if this needs name.
  dropzone: make((spec, backstage) => renderDropZone(spec, backstage.shared.providers)),
  grid: make((spec, backstage) => renderGrid(spec, backstage.shared)),
  selectbox: make((spec, backstage) => renderSelectBox(spec, backstage.shared.providers)),
  sizeinput: make((spec, backstage) => renderSizeInput(spec, backstage.shared.providers)),
  urlinput: make((spec, backstage) => renderUrlInput(spec, backstage, backstage.urlinput)),
  customeditor: make(renderCustomEditor),
  htmlpanel: make(renderHtmlPanel),
  imagetools: make((spec, backstage) => renderImageTools(spec, backstage.shared.providers)),
  table: make((spec, backstage) => renderTable(spec, backstage.shared.providers)),
  panel: make((spec, backstage) => renderPanel(spec, backstage))
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
        interpreter: (childSpec) => interpretParts(parts, childSpec, newBackstage)
      }
    }
  );

  return interpretParts(parts, spec, newBackstage);
};

const interpretParts: FormPartRenderer = (parts, spec, backstage) => Obj.get(factories, spec.type).fold(
  () => {
    console.error(`Unknown factory type "${spec.type}", defaulting to container: `, spec);
    return spec as AlloySpec;
  },
  (factory: FormPartRenderer) => factory(parts, spec, backstage)
);

const interpretWithoutForm: NoFormRenderer = (spec, backstage: UiFactoryBackstage) => {
  const parts = noFormParts;
  return interpretParts(parts, spec, backstage);
};

export { interpretInForm, interpretWithoutForm };
