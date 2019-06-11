import { PickerUi } from '../picker/PickerUi';
import { SizingSettings } from '../picker/Sizing';
import { PickerDirection } from './PickerDirection';
import { AriaGrid } from '@ephox/echo';

export default function (direction: PickerDirection, settings: SizingSettings, helpReference: AriaGrid) {
  return PickerUi(direction, settings, helpReference);
}