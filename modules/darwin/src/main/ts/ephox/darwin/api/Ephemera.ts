import { Fun } from '@ephox/katamari';
import Styles from '../style/Styles';

export interface Ephemera {
  selected: () => string;
  selectedSelector: () => string;
  firstSelected: () => string;
  firstSelectedSelector: () => string;
  lastSelected: () => string;
  lastSelectedSelector: () => string;
}

const selected = Styles.resolve('selected');
const selectedSelector = '.' + selected;
const firstSelected = Styles.resolve('first-selected');
const firstSelectedSelector = '.' + firstSelected;
const lastSelected = Styles.resolve('last-selected');
const lastSelectedSelector = '.' + lastSelected;

export const Ephemera: Ephemera = {
  selected: Fun.constant(selected),
  selectedSelector: Fun.constant(selectedSelector),
  firstSelected: Fun.constant(firstSelected),
  firstSelectedSelector: Fun.constant(firstSelectedSelector),
  lastSelected: Fun.constant(lastSelected),
  lastSelectedSelector: Fun.constant(lastSelectedSelector)
};