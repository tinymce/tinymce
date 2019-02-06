import { Fun } from '@ephox/katamari';
import CellPosition from '../picker/CellPosition';

var ltr = {
  pickerCell: CellPosition.findCellLtr,
  isRtl: Fun.constant(false)
};

var rtl = {
  pickerCell: CellPosition.findCellRtl,
  isRtl: Fun.constant(true)
};

export default {
  ltr: ltr,
  rtl: rtl
};