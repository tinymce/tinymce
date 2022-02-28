import { renderAutocompleteItem } from './build/AutocompleteMenuItem';
import { renderCardMenuItem } from './build/CardMenuItem';
import { renderChoiceItem } from './build/ChoiceItem';
import { renderFancyMenuItem } from './build/FancyMenuItem';
import { renderNestedItem } from './build/NestedMenuItem';
import { renderNormalItem } from './build/NormalMenuItem';
import { renderSeparatorItem } from './build/SeparatorItem';
import { renderToggleMenuItem } from './build/ToggleMenuItem';

const choice = renderChoiceItem;
const autocomplete = renderAutocompleteItem;
const separator = renderSeparatorItem;
const normal = renderNormalItem;
const nested = renderNestedItem;
const toggle = renderToggleMenuItem;
const fancy = renderFancyMenuItem;
const card = renderCardMenuItem;

export {
  choice,
  autocomplete,
  separator,
  normal,
  nested,
  toggle,
  fancy,
  card
};
