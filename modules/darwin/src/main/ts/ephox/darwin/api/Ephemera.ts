import * as Styles from '../style/Styles';

export interface Ephemera {
  readonly selected: string;
  readonly selectedSelector: string;
  readonly firstSelected: string;
  readonly firstSelectedSelector: string;
  readonly lastSelected: string;
  readonly lastSelectedSelector: string;
}

const selected = Styles.resolve('selected');
const selectedSelector = '.' + selected;
const firstSelected = Styles.resolve('first-selected');
const firstSelectedSelector = '.' + firstSelected;
const lastSelected = Styles.resolve('last-selected');
const lastSelectedSelector = '.' + lastSelected;

export const Ephemera: Ephemera = {
  selected,
  selectedSelector,
  firstSelected,
  firstSelectedSelector,
  lastSelected,
  lastSelectedSelector
};
