import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { alertBannerSchema } from './AlertBanner';
import { createBarFields } from './Bar';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';
import { buttonSchema } from './Button';
import { checkboxSchema } from './Checkbox';
import { collectionSchema } from './Collection';
import { colorInputSchema } from './ColorInput';
import { colorPickerSchema } from './ColorPicker';
import { customEditorSchema } from './CustomEditor';
import { dropZoneSchema } from './Dropzone';
import { createGridFields } from './Grid';
import { htmlPanelSchema } from './HtmlPanel';
import { iframeSchema } from './Iframe';
import { imageToolsSchema } from './ImageTools';
import { inputSchema } from './Input';
import { createLabelFields } from './Label';
import { listBoxSchema } from './ListBox';
import { selectBoxSchema } from './SelectBox';
import { sizeInputSchema } from './SizeInput';
import { tableSchema } from './Table';
import { textAreaSchema } from './Textarea';
import { urlInputSchema } from './UrlInput';

export interface PanelSpec {
  type: 'panel';
  classes?: string[];
  items: BodyComponentSpec[];
}

export interface Panel {
  type: 'panel';
  classes: string[];
  items: BodyComponent[];
}

const createItemsField = (name: string) => FieldSchema.field(
  'items',
  'items',
  FieldPresence.strict(),
  ValueSchema.arrOf(ValueSchema.valueOf((v) => ValueSchema.asRaw(`Checking item of ${name}`, itemSchema, v).fold(
    (sErr) => Result.error(ValueSchema.formatError(sErr)),
    (passValue) => Result.value(passValue)
  )))
);

// We're using a thunk here so we can refer to panel fields
export const itemSchema = ValueSchema.valueThunkOf(
  () => ValueSchema.chooseProcessor('type', {
    alertbanner: alertBannerSchema,
    bar: ValueSchema.objOf(createBarFields(createItemsField('bar'))),
    button: buttonSchema,
    checkbox: checkboxSchema,
    colorinput: colorInputSchema,
    colorpicker: colorPickerSchema,
    dropzone: dropZoneSchema,
    grid: ValueSchema.objOf(createGridFields(createItemsField('grid'))),
    iframe: iframeSchema,
    input: inputSchema,
    listbox: listBoxSchema,
    selectbox: selectBoxSchema,
    sizeinput: sizeInputSchema,
    textarea: textAreaSchema,
    urlinput: urlInputSchema,
    customeditor: customEditorSchema,
    htmlpanel: htmlPanelSchema,
    imagetools: imageToolsSchema,
    collection: collectionSchema,
    label: ValueSchema.objOf(createLabelFields(createItemsField('label'))),
    table: tableSchema,
    panel: panelSchema
  })
);

const panelFields = [
  FieldSchema.strictString('type'),
  FieldSchema.defaulted('classes', []),
  FieldSchema.strictArrayOf('items', itemSchema)
];

export const panelSchema = ValueSchema.objOf(panelFields);

export const createPanel = (spec: PanelSpec): Result<Panel, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<Panel>('panel', panelSchema, spec);
