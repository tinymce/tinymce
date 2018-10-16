import { FormField as AlloyFormField, Representing, SketchSpec, Typeahead } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Future, Option } from '@ephox/katamari';
import { renderFormField, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';

import * as MenuParts from '../menus/menu/MenuParts';
import * as NestedMenus from '../menus/menu/NestedMenus';
import { ItemResponse } from '../menus/item/MenuItems';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

// tslint:disable:no-console

// TODO: Compare with bridge.
export interface AutocompleteGoo {
  name: string;
  label: Option<string>;
  initialValue: string;
  getItems: (v: string) => Menu.MenuItemApi[];
}

export const renderAutocomplete = (spec: AutocompleteGoo, sharedBackstage: UiFactoryBackstageShared): SketchSpec => {
  const pLabel = renderLabel(spec.label.getOr('?'), sharedBackstage);

  const pField = AlloyFormField.parts().field({
    factory: Typeahead,
    dismissOnBlur: false,
    inputClasses: [ 'tox-textfield' ],
    minChars: 1,
    fetch: (input) => {
      const value = Representing.getValue(input);
      const items = spec.getItems(value);
      const tdata = NestedMenus.build(items, ItemResponse.BUBBLE_TO_SANDBOX, sharedBackstage.providers);
      return Future.pure(tdata);
    },

    markers: {
      // FIX:
      openClass: 'dog'
    },

    lazySink: sharedBackstage.getSink,
    parts : {
      menu: MenuParts.part(false, 1, 'normal')
    }
  });

  return renderFormField(Option.some(pLabel), pField);
};