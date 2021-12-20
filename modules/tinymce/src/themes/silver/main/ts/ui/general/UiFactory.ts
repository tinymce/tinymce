/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyParts, AlloySpec, FormTypes, SimpleOrSketchSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge/';
import { Fun, Merger, Obj } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
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
import { renderListBox } from '../dialog/ListBox';
import { renderPanel } from '../dialog/Panel';
import { renderSelectBox } from '../dialog/SelectBox';
import { renderSizeInput } from '../dialog/SizeInput';
import { renderSlider } from '../dialog/Slider';
import { renderTable } from '../dialog/Table';
import { renderInput, renderTextarea } from '../dialog/TextField';
import { renderUrlInput } from '../dialog/UrlInput';
import { renderAlertBanner } from './AlertBanner';
import { renderDialogButton } from './Button';
import { renderCheckbox } from './Checkbox';
import { renderHtmlPanel } from './HtmlPanel';

/* eslint-disable no-console */

export type FormPartRenderer<T extends Dialog.BodyComponent> = (parts: FormTypes.FormParts, spec: T, backstage: UiFactoryBackstage) => AlloySpec;
export type NoFormRenderer<T extends Dialog.BodyComponent> = (spec: T, backstage: UiFactoryBackstage) => AlloySpec;

const make = <T extends Dialog.BodyComponent>(render: NoFormRenderer<T>): FormPartRenderer<T> => {
  return (parts, spec, backstage) =>
    Obj.get(spec as Record<string, any>, 'name').fold(
      () => render(spec, backstage),
      (fieldName) => parts.field(fieldName, render(spec, backstage) as SimpleOrSketchSpec)
    );
};

const makeIframe = (render: NoFormRenderer<Dialog.Iframe>): FormPartRenderer<Dialog.Iframe> => (parts, spec, backstage) => {
  const iframeSpec = Merger.deepMerge(spec, {
    source: 'dynamic'
  });
  return make(render)(parts, iframeSpec, backstage);
};

const factories: Record<string, FormPartRenderer<any>> = {
  bar: make<Dialog.Bar>((spec, backstage) => renderBar(spec, backstage.shared)),
  collection: make<Dialog.Collection>((spec, backstage) => renderCollection(spec, backstage.shared.providers)),
  alertbanner: make<Dialog.AlertBanner>((spec, backstage) => renderAlertBanner(spec, backstage.shared.providers)),
  input: make<Dialog.Input>((spec, backstage) => renderInput(spec, backstage.shared.providers)),
  textarea: make<Dialog.TextArea>((spec, backstage) => renderTextarea(spec, backstage.shared.providers)),
  label: make<Dialog.Label>((spec, backstage) => renderLabel(spec, backstage.shared)),
  iframe: makeIframe((spec, backstage) => renderIFrame(spec, backstage.shared.providers)),
  button: make<Dialog.Button>((spec, backstage) => renderDialogButton(spec, backstage.shared.providers)),
  checkbox: make<Dialog.Checkbox>((spec, backstage) => renderCheckbox(spec, backstage.shared.providers)),
  colorinput: make<Dialog.ColorInput>((spec, backstage) => renderColorInput(spec, backstage.shared, backstage.colorinput)),
  colorpicker: make<Dialog.ColorPicker>((spec, backstage) => renderColorPicker(spec, backstage.shared.providers)), // Not sure if this needs name.
  dropzone: make<Dialog.DropZone>((spec, backstage) => renderDropZone(spec, backstage.shared.providers)),
  grid: make<Dialog.Grid>((spec, backstage) => renderGrid(spec, backstage.shared)),
  listbox: make<Dialog.ListBox>((spec, backstage) => renderListBox(spec, backstage)),
  selectbox: make<Dialog.SelectBox>((spec, backstage) => renderSelectBox(spec, backstage.shared.providers)),
  sizeinput: make<Dialog.SizeInput>((spec, backstage) => renderSizeInput(spec, backstage.shared.providers)),
  slider: make<Dialog.Slider>((spec, backstage) => renderSlider(spec, backstage.shared.providers)),
  urlinput: make<Dialog.UrlInput>((spec, backstage) => renderUrlInput(spec, backstage, backstage.urlinput)),
  customeditor: make<Dialog.CustomEditor>(renderCustomEditor),
  htmlpanel: make<Dialog.HtmlPanel>(renderHtmlPanel),
  imagetools: make<Dialog.ImageTools>((spec, backstage) => renderImageTools(spec, backstage.shared.providers)),
  table: make<Dialog.Table>((spec, backstage) => renderTable(spec, backstage.shared.providers)),
  panel: make<Dialog.Panel>((spec, backstage) => renderPanel(spec, backstage))
};

const noFormParts: FormTypes.FormParts = {
  // This is cast as we only actually want an alloy spec and don't need the actual part here
  field: (_name: string, spec: SimpleOrSketchSpec) => spec as unknown as AlloyParts.ConfiguredPart,
  record: Fun.constant([])
};

const interpretInForm = <T extends Dialog.BodyComponent>(parts: FormTypes.FormParts, spec: T, oldBackstage: UiFactoryBackstage) => {
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

const interpretParts = <T extends Dialog.BodyComponent>(parts: FormTypes.FormParts, spec: T, backstage: UiFactoryBackstage) =>
  Obj.get(factories, spec.type).fold(
    () => {
      console.error(`Unknown factory type "${spec.type}", defaulting to container: `, spec);
      return spec as unknown as AlloySpec;
    },
    (factory) => factory(parts, spec, backstage)
  );

const interpretWithoutForm = <T extends Dialog.BodyComponent>(spec: T, backstage: UiFactoryBackstage) =>
  interpretParts(noFormParts, spec, backstage);

export { interpretInForm, interpretWithoutForm };
