/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import { UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { Behaviour, GuiFactory, ItemTypes, Tooltipping } from '@ephox/alloy';
import { Obj, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { InlineContent, Types } from '@ephox/bridge';
import ItemResponse from 'tinymce/themes/silver/ui/menus/item/ItemResponse';
import { renderItemStructure } from 'tinymce/themes/silver/ui/menus/item/structure/ItemStructure';
import { buildData, renderCommonItem } from 'tinymce/themes/silver/ui/menus/item/build/CommonMenuItem';

type ItemValueHandler = (itemValue: string, itemMeta: Record<string, any>) => void;
type TooltipWorker = (success: (elem: HTMLElement) => void) => void;

// Use meta to pass through special information about the tooltip
// (yes this is horrible but it is not yet public API)
const tooltipBehaviour = (meta: Record<string, any>, sharedBackstage: UiFactoryBackstageShared): Behaviour.NamedConfiguredBehaviour<Behaviour.BehaviourConfigSpec, Behaviour.BehaviourConfigDetail>[] => {
  return Obj.get(meta, 'tooltipWorker').map((tooltipWorker: TooltipWorker) => {
    return [
      Tooltipping.config({
        lazySink: sharedBackstage.getSink,
        tooltipDom: {
          tag: 'div',
        },
        tooltipComponents: [
        ],
        anchor: (comp) => ({
          anchor: 'submenu',
          item: comp
        }),
        mode: 'follow-highlight',
        onShow: (component, _tooltip) => {
          tooltipWorker((elm) => {
            Tooltipping.setComponents(component, [
              GuiFactory.external({element: Element.fromDom(elm) })
            ]);
          });
        }
      })
    ];
  }).getOr([]);
};

const renderAutocompleteItem = (spec: InlineContent.AutocompleterItem, useText: boolean, presets: Types.PresetItemTypes, onItemValueHandler: ItemValueHandler, itemResponse: ItemResponse, sharedBackstage: UiFactoryBackstageShared, renderIcons: boolean = true): ItemTypes.ItemSpec => {

  const structure = renderItemStructure({
    presets,
    textContent:  useText ? spec.text : Option.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: Option.none(),
    checkMark: Option.none(),
    caret: Option.none(),
    value: spec.value
  }, sharedBackstage.providers, renderIcons, spec.icon);

  return renderCommonItem({
    data: buildData(spec),
    disabled: spec.disabled,
    getApi: () => ({}),
    onAction: (_api) => onItemValueHandler(spec.value, spec.meta),
    onSetup: () => () => { },
    triggersSubmenu: false,
    itemBehaviours: tooltipBehaviour(spec.meta, sharedBackstage),
  }, structure, itemResponse);
};

export { renderAutocompleteItem };