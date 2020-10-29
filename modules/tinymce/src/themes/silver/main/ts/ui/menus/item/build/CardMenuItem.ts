/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, Disabling } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Arr, Obj, Optional } from '@ephox/katamari';
import { UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { renderItemDomStructure } from 'tinymce/themes/silver/ui/menus/item/structure/ItemStructure';
import ItemResponse from '../ItemResponse';
import { renderContainer, renderDescription, renderHtml, renderImage } from '../structure/ItemSlices';
import { replaceText } from './AutocompleteMenuItem';
import { buildData, renderCommonItem } from './CommonMenuItem';

interface CardExtras {
  autocompleteMatchText?: string;
  itemBehaviours?: Array<Behaviour.NamedConfiguredBehaviour<Behaviour.BehaviourConfigSpec, Behaviour.BehaviourConfigDetail>>;
}

const render = (items: Menu.ContainerItem[], extras: CardExtras): Array<AlloySpec> => Arr.map(items, (item) => {
  switch (item.type) {
    case 'container':
      return renderContainer(render(item.items, extras), item.direction);

    case 'image':
      return renderImage(item.src, item.width, item.height, item.alt);

    case 'description':
      return renderDescription(item.text);

    case 'title':
      const matchText = Obj.get(extras, 'autocompleteMatchText').getOr('');
      return renderHtml(replaceText(item.text, matchText));
  }
});

export function renderCardMenuItem(
  spec: Menu.CardMenuItem,
  itemResponse: ItemResponse,
  sharedBackstage: UiFactoryBackstageShared,
  extras: CardExtras
) {
  const getApi = (component: AlloyComponent): Menu.CardMenuItemInstanceApi => ({
    isDisabled: () => Disabling.isDisabled(component),
    setDisabled: (state: boolean) => Disabling.set(component, state)
  });

  const structure = {
    dom: renderItemDomStructure(false, spec.text),
    optComponents: Arr.map(render(spec.items, extras), Optional.some)
  };

  return renderCommonItem({
    data: buildData(spec),
    disabled: spec.disabled,
    getApi,
    onAction: spec.onAction,
    onSetup: spec.onSetup,
    triggersSubmenu: false,
    itemBehaviours: Optional.from(extras.itemBehaviours).getOr([])
  }, structure, itemResponse, sharedBackstage.providers);
}
