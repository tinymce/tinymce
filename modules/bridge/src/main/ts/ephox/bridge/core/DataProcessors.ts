import { StructureProcessor } from '@ephox/boulder';
import { Arr, Optional, Type } from '@ephox/katamari';

import { checkboxDataProcessor } from '../components/dialog/Checkbox';
import { collectionDataProcessor } from '../components/dialog/Collection';
import { colorInputDataProcessor } from '../components/dialog/ColorInput';
import { colorPickerDataProcessor } from '../components/dialog/ColorPicker';
import { customEditorDataProcessor } from '../components/dialog/CustomEditor';
import { dropZoneDataProcessor } from '../components/dialog/Dropzone';
import { iframeDataProcessor } from '../components/dialog/Iframe';
import { imagePreviewDataProcessor } from '../components/dialog/ImagePreview';
import { inputDataProcessor } from '../components/dialog/Input';
import { listBoxDataProcessor } from '../components/dialog/ListBox';
import { selectBoxDataProcessor } from '../components/dialog/SelectBox';
import { sizeInputDataProcessor } from '../components/dialog/SizeInput';
import { sliderInputDataProcessor } from '../components/dialog/Slider';
import { textAreaDataProcessor } from '../components/dialog/Textarea';
import { dialogToggleMenuItemDataProcessor } from '../components/dialog/ToggleMenuItem';
import { urlInputDataProcessor } from '../components/dialog/UrlInput';
import { getAllObjects } from './ObjUtils';

interface NamedItem {
  readonly name: string;
  readonly type: string;
}

const isNamedItem = (obj: any): obj is NamedItem => Type.isString(obj.type) && Type.isString(obj.name);

const dataProcessors: Record<string, StructureProcessor> = {
  checkbox: checkboxDataProcessor,
  colorinput: colorInputDataProcessor,
  colorpicker: colorPickerDataProcessor,
  dropzone: dropZoneDataProcessor,
  input: inputDataProcessor,
  iframe: iframeDataProcessor,
  imagepreview: imagePreviewDataProcessor,
  selectbox: selectBoxDataProcessor,
  sizeinput: sizeInputDataProcessor,
  slider: sliderInputDataProcessor,
  listbox: listBoxDataProcessor,
  size: sizeInputDataProcessor,
  textarea: textAreaDataProcessor,
  urlinput: urlInputDataProcessor,
  customeditor: customEditorDataProcessor,
  collection: collectionDataProcessor,
  togglemenuitem: dialogToggleMenuItemDataProcessor
};

const getDataProcessor = (item: { type: string }): Optional<StructureProcessor> =>
  Optional.from(dataProcessors[item.type]);

const getNamedItems = (structure: any): NamedItem[] =>
  Arr.filter(getAllObjects(structure), isNamedItem);

export {
  getDataProcessor,
  getNamedItems
};
