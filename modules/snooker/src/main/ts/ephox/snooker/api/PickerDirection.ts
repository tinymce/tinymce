import { Fun } from '@ephox/katamari';
import CellPosition from '../picker/CellPosition';
import { Coords, Dimension, Grid, Address } from './Structs';

export interface PickerDirection {
  pickerCell: (position: Coords, dimensions: Dimension, grid: Grid, mouse: Coords) => Address;
  isRtl: () => boolean;
}

const ltr: PickerDirection = {
  pickerCell: CellPosition.findCellLtr,
  isRtl: Fun.constant(false)
};

const rtl: PickerDirection = {
  pickerCell: CellPosition.findCellRtl,
  isRtl: Fun.constant(true)
};

export const PickerDirection = {
  ltr,
  rtl
};