import { ValueSchema, FieldPresence, FieldSchema } from '@ephox/boulder';
import { alertBannerFields } from './AlertBanner';
import { createBarFields } from './Bar';
import { buttonFields } from './Button';
import { checkboxFields } from './Checkbox';
import { colorInputFields } from './ColorInput';
import { colorPickerFields } from './ColorPicker';
import { dropZoneFields } from './Dropzone';
import { createGridFields } from './Grid';
import { iframeFields } from './Iframe';
import { inputFields } from './Input';
import { selectBoxFields } from './SelectBox';
import { sizeInputFields } from './SizeInput';
import { textAreaFields } from './Textarea';
import { urlInputFields } from './UrlInput';
import { customEditorFields } from './CustomEditor';
import { htmlPanelFields } from './HtmlPanel';
import { imageToolsFields } from './ImageTools';
import { collectionFields } from './Collection';
import { createLabelFields } from './Label';
import { tableFields } from './Table';
import { Result } from '@ephox/katamari';

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

export const itemSchema = ValueSchema.choose('type', {
  alertbanner: alertBannerFields,
  bar: createBarFields(createItemsField('bar')),
  button: buttonFields,
  checkbox: checkboxFields,
  colorinput: colorInputFields,
  colorpicker: colorPickerFields,
  dropzone: dropZoneFields,
  grid: createGridFields(createItemsField('grid')),
  iframe: iframeFields,
  input: inputFields,
  selectbox: selectBoxFields,
  sizeinput: sizeInputFields,
  textarea: textAreaFields,
  urlinput: urlInputFields,
  customeditor: customEditorFields,
  htmlpanel: htmlPanelFields,
  imagetools: imageToolsFields,
  collection: collectionFields,
  label: createLabelFields(createItemsField('label')),
  table: tableFields
});
