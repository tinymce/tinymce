import { Behaviour, GuiFactory, ItemTypes, MaxHeight, Tooltipping } from '@ephox/alloy';
import { InlineContent, Toolbar } from '@ephox/bridge';
import { Fun, Obj, Optional, Regex } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import I18n from 'tinymce/core/api/util/I18n';
import { UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { buildData, renderCommonItem } from 'tinymce/themes/silver/ui/menus/item/build/CommonMenuItem';
import ItemResponse from 'tinymce/themes/silver/ui/menus/item/ItemResponse';
import { renderItemStructure } from 'tinymce/themes/silver/ui/menus/item/structure/ItemStructure';

type ItemValueHandler = (itemValue: string, itemMeta: Record<string, any>) => void;
type TooltipWorker = (success: (elem: HTMLElement) => void) => void;

// Use meta to pass through special information about the tooltip
// (yes this is horrible but it is not yet public API)
const tooltipBehaviour = (
  meta: Record<string, any>, sharedBackstage: UiFactoryBackstageShared
): Behaviour.NamedConfiguredBehaviour<any, any, any>[] =>
  Obj.get(meta, 'tooltipWorker')
    .map((tooltipWorker: TooltipWorker) => [
      Tooltipping.config({
        lazySink: sharedBackstage.getSink,
        tooltipDom: {
          tag: 'div',
          classes: [ 'tox-tooltip-worker-container' ]
        },
        tooltipComponents: [
        ],
        anchor: (comp) => ({
          type: 'submenu',
          item: comp,
          overrides: {
            // NOTE: this avoids it setting overflow and max-height.
            maxHeightFunction: MaxHeight.expandable
          }
        }),
        mode: 'follow-highlight',
        onShow: (component, _tooltip) => {
          tooltipWorker((elm) => {
            Tooltipping.setComponents(component, [
              GuiFactory.external({ element: SugarElement.fromDom(elm) })
            ]);
          });
        }
      })
    ])
    .getOr([]);

const encodeText = (text: string) => DOMUtils.DOM.encode(text);
const replaceText = (text: string, matchText: string): string => {
  const translated = I18n.translate(text);
  const encoded = encodeText(translated);
  if (matchText.length > 0) {
    const escapedMatchRegex = new RegExp(Regex.escape(matchText), 'gi');
    return encoded.replace(escapedMatchRegex, (match) => `<span class="tox-autocompleter-highlight">${match}</span>`);
  } else {
    return encoded;
  }
};

const renderAutocompleteItem = (
  spec: InlineContent.AutocompleterItem,
  matchText: string,
  useText: boolean,
  presets: Toolbar.PresetItemTypes,
  onItemValueHandler: ItemValueHandler,
  itemResponse: ItemResponse,
  sharedBackstage: UiFactoryBackstageShared,
  renderIcons: boolean = true
): ItemTypes.ItemSpec => {
  const structure = renderItemStructure({
    presets,
    textContent: Optional.none(),
    htmlContent: useText ? spec.text.map((text) => replaceText(text, matchText)) : Optional.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: Optional.none(),
    checkMark: Optional.none(),
    caret: Optional.none(),
    value: spec.value
  }, sharedBackstage.providers, renderIcons, spec.icon);

  return renderCommonItem({
    data: buildData(spec),
    enabled: spec.enabled,
    getApi: Fun.constant({}),
    onAction: (_api) => onItemValueHandler(spec.value, spec.meta),
    onSetup: Fun.constant(Fun.noop),
    triggersSubmenu: false,
    itemBehaviours: tooltipBehaviour(spec.meta, sharedBackstage)
  }, structure, itemResponse, sharedBackstage.providers);
};

export { renderAutocompleteItem, replaceText, tooltipBehaviour };
