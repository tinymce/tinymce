import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Bubble, Disabling, EventFormat, FormField as AlloyFormField, Keying,
  Layout,
  NativeEvents, Replacing, Representing, SimulatedEvent, SketchSpec, SystemEvents, Tabstopping, Tooltipping
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Attribute, Class, EventArgs, Focus, Html, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import Entities from 'tinymce/core/api/html/Entities';
import I18n from 'tinymce/core/api/util/I18n';
import { renderFormFieldWith, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as UiState from '../../UiState';
import { detectSize } from '../alien/FlatgridAutodetect';
import { formActionEvent, formResizeEvent } from '../general/FormEvents';
import * as ItemClasses from '../menus/item/ItemClasses';
import { deriveCollectionMovement } from '../menus/menu/MenuMovement';

type CollectionSpec = Omit<Dialog.Collection, 'type'>;

type ItemCallback<T extends EventFormat> = (c: AlloyComponent, se: SimulatedEvent<T>, tgt: SugarElement<HTMLElement>, itemValue: string | undefined) => void;

export const renderCollection = (
  spec: CollectionSpec,
  providersBackstage: UiFactoryBackstageProviders,
  initialData: Optional<Dialog.CollectionItem[]>
): SketchSpec => {
  // DUPE with TextField.
  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const icons = providersBackstage.icons();

  // TINY-10174: Icon string is either in icon pack or displayed directly
  const getIcon = (icon: string) => icons[icon] ?? icon;

  const runOnItem = <T extends EventFormat>(f: ItemCallback<T>) => (comp: AlloyComponent, se: SimulatedEvent<T>) => {
    SelectorFind.closest<HTMLElement>(se.event.target, '[data-collection-item-value]').each((target) => {
      f(comp, se, target, Attribute.get(target, 'data-collection-item-value'));
    });
  };

  const setContents = (comp: AlloyComponent, items: Dialog.CollectionItem[]) => {
    // Giving it a default `mode:design` context, these shouldn't run at all in mode:readonly
    const disabled = providersBackstage.checkUiComponentContext('mode:design').shouldDisable || providersBackstage.isDisabled();
    const disabledClass = disabled ? ' tox-collection__item--state-disabled' : '';

    const htmlLines = Arr.map(items, (item) => {
      const itemText = I18n.translate(item.text);
      const textContent = spec.columns === 1 ? `<div class="tox-collection__item-label">${itemText}</div>` : '';

      const iconContent = `<div class="tox-collection__item-icon">${getIcon(item.icon)}</div>`;

      // Replacing the hyphens and underscores in collection items with spaces
      // to ensure the screen readers pronounce the words correctly.
      // This is only for aria purposes. Emoticon and Special Character names will still use _ and - for autocompletion.
      const mapItemName: Record<string, string> = {
        '_': ' ',
        ' - ': ' ',
        '-': ' '
      };

      // Using aria-label here overrides the Apple description of emojis and special characters in Mac/ MS description in Windows.
      // But if only the title attribute is used instead, the names are read out twice. i.e., the description followed by the item.text.
      const ariaLabel = itemText.replace(/\_| \- |\-/g, (match) => mapItemName[match]);

      return `<div data-mce-tooltip="${ariaLabel}" class="tox-collection__item${disabledClass}" tabindex="-1" data-collection-item-value="${Entities.encodeAllRaw(item.value)}" aria-label="${ariaLabel}">${iconContent}${textContent}</div>`;
    });

    const chunks = spec.columns !== 'auto' && spec.columns > 1 ? Arr.chunk(htmlLines, spec.columns) : [ htmlLines ];
    const html = Arr.map(chunks, (ch) => `<div class="tox-collection__group">${ch.join('')}</div>`);

    Html.set(comp.element, html.join(''));
  };

  const onClick = runOnItem((comp, se, tgt, itemValue) => {
    se.stop();
    if (!(providersBackstage.checkUiComponentContext('mode:design').shouldDisable || providersBackstage.isDisabled())) {
      AlloyTriggers.emitWith(comp, formActionEvent, {
        name: spec.name,
        value: itemValue
      });
    }
  });

  const collectionEvents = [
    AlloyEvents.run<EventArgs>(NativeEvents.mouseover(), runOnItem((comp, se, tgt) => {
      Focus.focus(tgt, true);
    })),
    AlloyEvents.run<EventArgs>(NativeEvents.click(), onClick),
    AlloyEvents.run<EventArgs>(SystemEvents.tap(), onClick),
    AlloyEvents.run(NativeEvents.focusin(), runOnItem((comp, se, tgt) => {
      SelectorFind.descendant(comp.element, '.' + ItemClasses.activeClass).each((currentActive) => {
        Class.remove(currentActive, ItemClasses.activeClass);
      });
      Class.add(tgt, ItemClasses.activeClass);
    })),
    AlloyEvents.run(NativeEvents.focusout(), runOnItem((comp) => {
      SelectorFind.descendant<HTMLElement>(comp.element, '.' + ItemClasses.activeClass).each((currentActive) => {
        Class.remove(currentActive, ItemClasses.activeClass);
        Focus.blur(currentActive);
      });
    })),
    AlloyEvents.runOnExecute(runOnItem((comp, se, tgt, itemValue) => {
      AlloyTriggers.emitWith(comp, formActionEvent, {
        name: spec.name,
        value: itemValue
      });
    })),
  ];

  const iterCollectionItems = (comp: AlloyComponent, applyAttributes: (element: SugarElement<Element>) => void) =>
    Arr.map(SelectorFilter.descendants(comp.element, '.tox-collection__item'), applyAttributes);

  const pField = AlloyFormField.parts.field({
    dom: {
      tag: 'div',
      // FIX: Read from columns
      classes: [ 'tox-collection' ].concat(spec.columns !== 1 ? [ 'tox-collection--grid' ] : [ 'tox-collection--list' ])
    },
    components: [ ],
    factory: { sketch: Fun.identity },
    behaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => providersBackstage.checkUiComponentContext(spec.context).shouldDisable,
        onDisabled: (comp) => {
          iterCollectionItems(comp, (childElm) => {
            Class.add(childElm, 'tox-collection__item--state-disabled');
            Attribute.set(childElm, 'aria-disabled', true);
          });
        },
        onEnabled: (comp) => {
          iterCollectionItems(comp, (childElm) => {
            Class.remove(childElm, 'tox-collection__item--state-disabled');
            Attribute.remove(childElm, 'aria-disabled');
          });
        }
      }),
      UiState.toggleOnReceive(() => providersBackstage.checkUiComponentContext(spec.context)),
      Replacing.config({ }),
      Tooltipping.config(
        {
          ...providersBackstage.tooltips.getConfig({
            tooltipText: '',
            onShow: (comp) => {
              SelectorFind.descendant(comp.element, '.' + ItemClasses.activeClass + '[data-mce-tooltip]').each((current) => {
                Attribute.getOpt(current, 'data-mce-tooltip').each((text) => {
                  Tooltipping.setComponents(comp, providersBackstage.tooltips.getComponents( { tooltipText: text }));
                });
              });
            }
          }),
          mode: 'children-keyboard-focus',
          anchor: (comp: AlloyComponent) => ({
            type: 'node',
            node: SelectorFind.descendant(comp.element, '.' + ItemClasses.activeClass).orThunk(() => SelectorFind.first('.tox-collection__item')),
            root: comp.element,
            layouts: {
              onLtr: Fun.constant([ Layout.south, Layout.north, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ]),
              onRtl: Fun.constant([ Layout.south, Layout.north, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ])
            },
            bubble: Bubble.nu(0, -2, {}),
          })
        }
      ),
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: initialData.getOr([])
        },
        onSetValue: (comp, items) => {
          setContents(comp, items);
          if (spec.columns === 'auto') {
            detectSize(comp, 5, 'tox-collection__item').each(({ numRows, numColumns }) => {
              Keying.setGridSize(comp, numRows, numColumns);
            });
          }

          AlloyTriggers.emit(comp, formResizeEvent);
        }
      }),
      Tabstopping.config({ }),
      Keying.config(
        deriveCollectionMovement(spec.columns, 'normal')
      ),
      AddEventsBehaviour.config('collection-events', collectionEvents)
    ]),
    eventOrder: {
      [SystemEvents.execute()]: [ 'disabling', 'alloy.base.behaviour', 'collection-events' ],
      [NativeEvents.focusin()]: [ 'collection-events', 'tooltipping' ],
    }
  });

  const extraClasses = [ 'tox-form__group--collection' ];

  return renderFormFieldWith(pLabel, pField, extraClasses, [ ]);
};
