import { ValueSchema } from '@ephox/boulder';
import { alertBannerFields } from './AlertBanner';
import { buttonFields } from './Button';
import { checkboxFields } from './Checkbox';
import { colorInputFields } from './ColorInput';
import { colorPickerFields } from './ColorPicker';
import { dropZoneFields } from './Dropzone';
import { gridFields } from './Grid';
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
import { labelFields } from './Label';

export const itemSchema = ValueSchema.choose('type', {
  alertbanner: alertBannerFields,
  button: buttonFields,
  checkbox: checkboxFields,
  colorinput: colorInputFields,
  colorpicker: colorPickerFields,
  dropzone: dropZoneFields,
  grid: gridFields,
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
  label: labelFields
});
