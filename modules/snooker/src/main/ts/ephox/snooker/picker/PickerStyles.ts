import { Fun } from '@ephox/katamari';
import Styles from '../style/Styles';

const table = Styles.resolve('table-picker');
const row = Styles.resolve('table-picker-row');
const cell = Styles.resolve('table-picker-cell');
const button = Styles.resolve('table-picker-button');

export default {
  table: Fun.constant(table) as () => string,
  row: Fun.constant(row) as () => string,
  cell: Fun.constant(cell) as () => string,
  button: Fun.constant(button) as () => string
};