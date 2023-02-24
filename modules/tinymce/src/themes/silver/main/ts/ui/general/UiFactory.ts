import { AlloyParts, AlloySpec, FormTypes, SimpleOrSketchSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge/';
import { Fun, Merger, Obj, Optional } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderBar } from '../dialog/Bar';
import { renderCollection } from '../dialog/Collection';
import { renderColorInput } from '../dialog/ColorInput';
import { renderColorPicker } from '../dialog/ColorPicker';
import { renderCustomEditor } from '../dialog/CustomEditor';
import { renderDropZone } from '../dialog/Dropzone';
import { renderGrid } from '../dialog/Grid';
import { renderIFrame } from '../dialog/IFrame';
import { renderImagePreview } from '../dialog/ImagePreview';
import { renderLabel } from '../dialog/Label';
import { renderListBox } from '../dialog/ListBox';
import { renderPanel } from '../dialog/Panel';
import { renderSelectBox } from '../dialog/SelectBox';
import { renderSizeInput } from '../dialog/SizeInput';
import { renderSlider } from '../dialog/Slider';
import { renderTable } from '../dialog/Table';
import { renderInput, renderTextarea } from '../dialog/TextField';
import { renderTree } from '../dialog/Tree';
import { renderUrlInput } from '../dialog/UrlInput';
import { renderAlertBanner } from './AlertBanner';
import { renderDialogButton } from './Button';
import { renderCheckbox } from './Checkbox';
import { renderHtmlPanel } from './HtmlPanel';

/* eslint-disable no-console */

export type FormPartRenderer<T extends Dialog.BodyComponent> = (parts: FormTypes.FormParts, spec: T, dialogData: Dialog.DialogData, backstage: UiFactoryBackstage) => AlloySpec;
export type NoFormRenderer<T extends Dialog.BodyComponent, U> = (spec: T, backstage: UiFactoryBackstage, data: Optional<U>) => AlloySpec;

const make = <T extends Dialog.BodyComponent, U = unknown>(render: NoFormRenderer<T, U>): FormPartRenderer<T> => {
  return (parts, spec, dialogData, backstage) =>
    Obj.get(spec as Record<string, any>, 'name').fold(
      () => render(spec, backstage, Optional.none()),
      (fieldName) => parts.field(fieldName, render(spec, backstage, Obj.get(dialogData, fieldName)) as SimpleOrSketchSpec)
    );
};

const makeIframe = (render: NoFormRenderer<Dialog.Iframe, string>): FormPartRenderer<Dialog.Iframe> => (parts, spec, dialogData, backstage) => {
  const iframeSpec = Merger.deepMerge(spec, {
    source: 'dynamic'
  });
  return make(render)(parts, iframeSpec, dialogData, backstage);
};

const factories: Record<string, FormPartRenderer<any>> = {
  bar: make<Dialog.Bar>((spec, backstage) => renderBar(spec, backstage.shared)),
  collection: make<Dialog.Collection, Dialog.CollectionItem[]>((spec, backstage, data) => renderCollection(spec, backstage.shared.providers, data)),
  alertbanner: make<Dialog.AlertBanner>((spec, backstage) => renderAlertBanner(spec, backstage.shared.providers)),
  input: make<Dialog.Input, string>((spec, backstage, data) => renderInput(spec, backstage.shared.providers, data)),
  textarea: make<Dialog.TextArea, string>((spec, backstage, data) => renderTextarea(spec, backstage.shared.providers, data)),
  label: make<Dialog.Label>((spec, backstage) => renderLabel(spec, backstage.shared)),
  iframe: makeIframe((spec, backstage, data) => renderIFrame(spec, backstage.shared.providers, data)),
  button: make<Dialog.Button>((spec, backstage) => renderDialogButton(spec, backstage.shared.providers)),
  checkbox: make<Dialog.Checkbox, boolean>((spec, backstage, data) => renderCheckbox(spec, backstage.shared.providers, data)),
  colorinput: make<Dialog.ColorInput, string>((spec, backstage, data) => renderColorInput(spec, backstage.shared, backstage.colorinput, data)),
  colorpicker: make<Dialog.ColorPicker, string>((spec, backstage, data) => renderColorPicker(spec, backstage.shared.providers, data)), // Not sure if this needs name.
  dropzone: make<Dialog.DropZone, string[]>((spec, backstage, data) => renderDropZone(spec, backstage.shared.providers, data)),
  grid: make<Dialog.Grid>((spec, backstage) => renderGrid(spec, backstage.shared)),
  listbox: make<Dialog.ListBox, string>((spec, backstage, data) => renderListBox(spec, backstage, data)),
  selectbox: make<Dialog.SelectBox, string>((spec, backstage, data) => renderSelectBox(spec, backstage.shared.providers, data)),
  sizeinput: make<Dialog.SizeInput>((spec, backstage) => renderSizeInput(spec, backstage.shared.providers)),
  slider: make<Dialog.Slider, number>((spec, backstage, data) => renderSlider(spec, backstage.shared.providers, data)),
  urlinput: make<Dialog.UrlInput, Dialog.UrlInputData>((spec, backstage, data) => renderUrlInput(spec, backstage, backstage.urlinput, data)),
  customeditor: make<Dialog.CustomEditor>(renderCustomEditor),
  htmlpanel: make<Dialog.HtmlPanel>(renderHtmlPanel),
  imagepreview: make<Dialog.ImagePreview, Dialog.ImagePreviewData>((spec, _, data) => renderImagePreview(spec, data)),
  table: make<Dialog.Table>((spec, backstage) => renderTable(spec, backstage.shared.providers)),
  tree: make<Dialog.Tree>((spec, backstage) => renderTree(spec, backstage)),
  panel: make<Dialog.Panel>((spec, backstage) => renderPanel(spec, backstage))
};

const noFormParts: FormTypes.FormParts = {
  // This is cast as we only actually want an alloy spec and don't need the actual part here
  field: (_name: string, spec: SimpleOrSketchSpec) => spec as unknown as AlloyParts.ConfiguredPart,
  record: Fun.constant([])
};

const interpretInForm = <T extends Dialog.BodyComponent>(parts: FormTypes.FormParts, spec: T, dialogData: Dialog.DialogData, oldBackstage: UiFactoryBackstage): AlloySpec => {
  // Now, we need to update the backstage to use the parts variant.
  const newBackstage = Merger.deepMerge(
    oldBackstage,
    {
      // Add the interpreter based on the form parts.
      shared: {
        interpreter: (childSpec: T) => interpretParts(parts, childSpec, dialogData, newBackstage)
      }
    }
  );

  return interpretParts(parts, spec, dialogData, newBackstage);
};

const interpretParts = <T extends Dialog.BodyComponent>(parts: FormTypes.FormParts, spec: T, dialogData: Dialog.DialogData, backstage: UiFactoryBackstage): AlloySpec =>
  Obj.get(factories, spec.type).fold(
    () => {
      console.error(`Unknown factory type "${spec.type}", defaulting to container: `, spec);
      return spec as unknown as AlloySpec;
    },
    (factory) => factory(parts, spec, dialogData, backstage)
  );

const interpretWithoutForm = <T extends Dialog.BodyComponent>(spec: T, dialogData: Dialog.DialogData, backstage: UiFactoryBackstage): AlloySpec =>
  interpretParts(noFormParts, spec, dialogData, backstage);

export { interpretInForm, interpretWithoutForm };
