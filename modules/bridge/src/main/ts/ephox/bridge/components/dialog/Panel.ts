import { BodyComponentApi, BodyComponent } from './BodyComponent';
import { Result } from '@ephox/katamari';
import { ValueSchema, FieldSchema, FieldPresence } from '@ephox/boulder';
import { alertBannerSchema } from './AlertBanner';
import { createBarFields } from './Bar';
import { buttonSchema } from './Button';
import { checkboxSchema } from './Checkbox';
import { colorInputSchema } from './ColorInput';
import { colorPickerSchema } from './ColorPicker';
import { dropZoneSchema } from './Dropzone';
import { createGridFields } from './Grid';
import { iframeSchema } from './Iframe';
import { inputSchema } from './Input';
import { selectBoxSchema } from './SelectBox';
import { sizeInputSchema } from './SizeInput';
import { textAreaSchema } from './Textarea';
import { urlInputSchema } from './UrlInput';
import { customEditorSchema } from './CustomEditor';
import { htmlPanelSchema } from './HtmlPanel';
import { imageToolsSchema } from './ImageTools';
import { collectionSchema } from './Collection';
import { createLabelFields } from './Label';
import { tableSchema } from './Table';

export interface PanelApi {
  type: 'panel';
  classes?: string[];
  items: BodyComponentApi[];
}

export interface Panel {
  type: 'panel';
  classes: string[];
  items: BodyComponent[];
}

const createItemsField = (name: string) => {
  return FieldSchema.field(
    'items',
    'items',
    FieldPresence.strict(),
    ValueSchema.arrOf(ValueSchema.valueOf((v) => {
      return ValueSchema.asRaw(`Checking item of ${name}`, itemSchema, v).fold(
        (sErr) => Result.error(ValueSchema.formatError(sErr)),
        (passValue) => Result.value(passValue)
      );
    }))
  );
};

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

export const createPanel = (spec: PanelApi): Result<Panel, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw<Panel>('panel', panelSchema, spec);
};