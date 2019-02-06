import { Fun } from '@ephox/katamari';
import Styles from '../style/Styles';

var table = Styles.resolve('table-picker');
var row = Styles.resolve('table-picker-row');
var cell = Styles.resolve('table-picker-cell');
var button = Styles.resolve('table-picker-button');

export default {
  table: Fun.constant(table),
  row: Fun.constant(row),
  cell: Fun.constant(cell),
  button: Fun.constant(button)
};