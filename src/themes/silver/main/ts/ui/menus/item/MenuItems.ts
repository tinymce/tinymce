import { renderAutocompleteItem, renderChoiceItem } from './build/ChoiceItem';
import { renderFancyMenuItem } from './build/FancyMenuItem';
import { renderNormalItem } from './build/NormalMenuItem';
import { renderSeparatorItem } from './build/SeparatorItem';
import { renderStyleItem } from './build/StyleMenuItem';
import { renderToggleMenuItem } from './build/ToggleMenuItem';

export enum ItemResponse { CLOSE_ON_EXECUTE, BUBBLE_TO_SANDBOX }

const choice = renderChoiceItem;
const autocomplete = renderAutocompleteItem;
const separator = renderSeparatorItem;
const style = renderStyleItem;
const normal = renderNormalItem;
const toggle = renderToggleMenuItem;
const fancy = renderFancyMenuItem;

export {
  choice,
  autocomplete,
  separator,
  style,
  normal,
  toggle,
  fancy
};
