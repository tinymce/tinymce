import { FieldPresence, FieldSchema, StructureSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
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
import { imagePreviewSchema } from './ImagePreview';
import { inputSchema } from './Input';
import { createLabelFields } from './Label';
import { listBoxSchema } from './ListBox';
import { selectBoxSchema } from './SelectBox';
import { sizeInputSchema } from './SizeInput';
import { sliderSchema } from './Slider';
import { tableSchema } from './Table';
import { textAreaSchema } from './Textarea';
import { treeSchema } from './Tree';
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
  FieldPresence.required(),
  StructureSchema.arrOf(StructureSchema.valueOf((v) => StructureSchema.asRaw(`Checking item of ${name}`, itemSchema, v).fold(
    (sErr) => Result.error(StructureSchema.formatError(sErr)),
    (passValue) => Result.value(passValue)
  )))
);

// We're using a thunk here so we can refer to panel fields
export const itemSchema = StructureSchema.valueThunkOf(
  () => StructureSchema.chooseProcessor('type', {
    alertbanner: alertBannerSchema,
    bar: StructureSchema.objOf(createBarFields(createItemsField('bar'))),
    button: buttonSchema,
    checkbox: checkboxSchema,
    colorinput: colorInputSchema,
    colorpicker: colorPickerSchema,
    dropzone: dropZoneSchema,
    grid: StructureSchema.objOf(createGridFields(createItemsField('grid'))),
    iframe: iframeSchema,
    input: inputSchema,
    listbox: listBoxSchema,
    selectbox: selectBoxSchema,
    sizeinput: sizeInputSchema,
    slider: sliderSchema,
    textarea: textAreaSchema,
    urlinput: urlInputSchema,
    customeditor: customEditorSchema,
    htmlpanel: htmlPanelSchema,
    imagepreview: imagePreviewSchema,
    collection: collectionSchema,
    label: StructureSchema.objOf(createLabelFields(createItemsField('label'))),
    table: tableSchema,
    tree: treeSchema,
    panel: panelSchema
  })
);

const panelFields = [
  ComponentSchema.type,
  FieldSchema.defaulted('classes', []),
  FieldSchema.requiredArrayOf('items', itemSchema)
];

export const panelSchema = StructureSchema.objOf(panelFields);

export const createPanel = (spec: PanelSpec): Result<Panel, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<Panel>('panel', panelSchema, spec);
