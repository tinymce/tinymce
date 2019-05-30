import { Fun } from '@ephox/katamari';
import CellPosition from '../picker/CellPosition';

const ltr = {
  pickerCell: CellPosition.findCellLtr,
  isRtl: Fun.constant(false)
};

const rtl = {
  pickerCell: CellPosition.findCellRtl,
  isRtl: Fun.constant(true)
};

export default {
  ltr,
  rtl
};