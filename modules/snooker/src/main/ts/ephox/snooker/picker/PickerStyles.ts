import { Fun } from '@ephox/katamari';
import Styles from '../style/Styles';

const table = Styles.resolve('table-picker');
const row = Styles.resolve('table-picker-row');
const cell = Styles.resolve('table-picker-cell');
const button = Styles.resolve('table-picker-button');

export default {
  table: Fun.constant(table),
  row: Fun.constant(row),
  cell: Fun.constant(cell),
  button: Fun.constant(button)
};