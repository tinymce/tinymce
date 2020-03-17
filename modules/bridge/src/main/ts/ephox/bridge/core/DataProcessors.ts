import { Processor } from '@ephox/boulder';
import { Arr, Option, Type } from '@ephox/katamari';

import { checkboxDataProcessor } from '../components/dialog/Checkbox';
import { colorInputDataProcessor } from '../components/dialog/ColorInput';
import { colorPickerDataProcessor } from '../components/dialog/ColorPicker';
import { customEditorDataProcessor } from '../components/dialog/CustomEditor';
import { dropZoneDataProcessor } from '../components/dialog/Dropzone';
import { iframeDataProcessor } from '../components/dialog/Iframe';
import { inputDataProcessor } from '../components/dialog/Input';
import { selectBoxDataProcessor } from '../components/dialog/SelectBox';
import { sizeInputDataProcessor } from '../components/dialog/SizeInput';
import { textAreaDataProcessor } from '../components/dialog/Textarea';
import { urlInputDataProcessor } from '../components/dialog/UrlInput';
import { getAllObjects } from './ObjUtils';
import { collectionDataProcessor } from '../components/dialog/Collection';
import { dialogToggleMenuItemDataProcessor } from '../components/dialog/ToggleMenuItem';

const isNamedItem = (obj) => Type.isString(obj.type) && Type.isString(obj.name);

const dataProcessors = {
  checkbox: checkboxDataProcessor,
  colorinput: colorInputDataProcessor,
  colorpicker: colorPickerDataProcessor,
  dropzone: dropZoneDataProcessor,
  input: inputDataProcessor,
  iframe: iframeDataProcessor,
  sizeinput: sizeInputDataProcessor,
  selectbox: selectBoxDataProcessor,
  size: sizeInputDataProcessor,
  textarea: textAreaDataProcessor,
  urlinput: urlInputDataProcessor,
  customeditor: customEditorDataProcessor,
  collection: collectionDataProcessor,
  togglemenuitem: dialogToggleMenuItemDataProcessor
};

const getDataProcessor = (item): Option<Processor> => Option.from(dataProcessors[item.type]);

const getNamedItems = (structure) => Arr.filter(getAllObjects(structure), isNamedItem);

export {
  getDataProcessor,
  getNamedItems
};