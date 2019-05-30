import Styles from '../style/Styles';
import { Fun } from '@ephox/katamari';

var selected = Styles.resolve('selected');
var selectedSelector = '.' + selected;
var firstSelected = Styles.resolve('first-selected');
var firstSelectedSelector = '.' + firstSelected;
var lastSelected = Styles.resolve('last-selected');
var lastSelectedSelector = '.' + lastSelected;

export default <any> {
  selected: Fun.constant(selected),
  selectedSelector: Fun.constant(selectedSelector),
  firstSelected: Fun.constant(firstSelected),
  firstSelectedSelector: Fun.constant(firstSelectedSelector),
  lastSelected: Fun.constant(lastSelected),
  lastSelectedSelector: Fun.constant(lastSelectedSelector)
};