/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { FormField as AlloyFormField, Representing, SketchSpec, Typeahead } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Future, Option } from '@ephox/katamari';
import { renderFormField, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';

import * as MenuParts from '../menus/menu/MenuParts';
import * as NestedMenus from '../menus/menu/NestedMenus';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import ItemResponse from '../menus/item/ItemResponse';

// tslint:disable:no-console

// TODO: Compare with bridge.
export interface AutocompleteGoo {
  name: string;
  label: Option<string>;
  initialValue: string;
  getItems: (v: string) => Menu.MenuItemApi[];
}

export const renderAutocomplete = (spec: AutocompleteGoo, backstage: UiFactoryBackstage): SketchSpec => {
  const pLabel = renderLabel(spec.label.getOr('?'), backstage.shared.providers);

  const pField = AlloyFormField.parts().field({
    factory: Typeahead,
    dismissOnBlur: false,
    inputClasses: [ 'tox-textfield' ],
    minChars: 1,
    fetch: (input) => {
      const value = Representing.getValue(input);
      const items = spec.getItems(value);
      const tdata = NestedMenus.build(items, ItemResponse.BUBBLE_TO_SANDBOX, backstage);
      return Future.pure(tdata);
    },

    markers: {
      // FIX:
      openClass: 'dog'
    },

    lazySink: backstage.shared.getSink,
    parts : {
      menu: MenuParts.part(false, 1, 'normal')
    }
  });

  return renderFormField(Option.some(pLabel), pField);
};