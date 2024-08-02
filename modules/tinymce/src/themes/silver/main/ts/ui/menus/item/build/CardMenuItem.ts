import { AlloyComponent, AlloySpec, Behaviour, Disabling, ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';
import { SelectorFilter } from '@ephox/sugar';

import { UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { renderItemDomStructure } from 'tinymce/themes/silver/ui/menus/item/structure/ItemStructure';

import * as ItemClasses from '../ItemClasses';
import ItemResponse from '../ItemResponse';
import { renderContainer, renderHtml, renderImage } from '../structure/ItemSlices';
import { replaceText } from './AutocompleteMenuItem';
import { buildData, renderCommonItem } from './CommonMenuItem';

export interface CardExtras {
  readonly itemBehaviours?: Behaviour.NamedConfiguredBehaviour<any, any, any>[];
  // Extras specific to cardText components
  readonly cardText: {
    readonly matchText?: string;
    readonly highlightOn: string[];
  };
}

const render = (items: Menu.CardItem[], extras: CardExtras): Array<AlloySpec> => Arr.map(items, (item) => {
  switch (item.type) {
    case 'cardcontainer':
      return renderContainer(item, render(item.items, extras));

    case 'cardimage':
      return renderImage(item.src, item.classes, item.alt);

    case 'cardtext':
      // Only highlight targeted text components
      const shouldHighlight = item.name.exists((name) => Arr.contains(extras.cardText.highlightOn, name));
      const matchText = shouldHighlight ? Optional.from(extras.cardText.matchText).getOr('') : '';
      return renderHtml(replaceText(item.text, matchText), item.classes);
  }
});

export const renderCardMenuItem = (
  spec: Menu.CardMenuItem,
  itemResponse: ItemResponse,
  sharedBackstage: UiFactoryBackstageShared,
  extras: CardExtras
): ItemTypes.ItemSpec => {
  const getApi = (component: AlloyComponent): Menu.CardMenuItemInstanceApi => ({
    isEnabled: () => !Disabling.isDisabled(component),
    setEnabled: (state: boolean) => {
      Disabling.set(component, !state);

      // Disable sub components
      Arr.each(SelectorFilter.descendants(component.element, '*'), (elm) => {
        component.getSystem().getByDom(elm).each((comp: AlloyComponent) => {
          if (comp.hasConfigured(Disabling)) {
            Disabling.set(comp, !state);
          }
        });
      });
    }
  });

  const structure = {
    dom: renderItemDomStructure(spec.label),
    optComponents: [
      Optional.some({
        dom: {
          tag: 'div',
          classes: [ ItemClasses.containerClass, ItemClasses.containerRowClass ]
        },
        components: render(spec.items, extras)
      })
    ]
  };

  return renderCommonItem({
    data: buildData({ text: Optional.none(), ...spec }),
    enabled: spec.enabled,
    getApi,
    onAction: spec.onAction,
    onSetup: spec.onSetup,
    triggersSubmenu: false,
    itemBehaviours: Optional.from(extras.itemBehaviours).getOr([])
  }, structure, itemResponse, sharedBackstage.providers);
};
