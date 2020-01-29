/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, EventFormat, FormField as AlloyFormField, Keying, NativeEvents, Replacing, Representing, SimulatedEvent, SketchSpec, SystemEvents, Tabstopping } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';

import { Attr, Class, Element, EventArgs, Focus, Html, SelectorFind } from '@ephox/sugar';
import I18n from 'tinymce/core/api/util/I18n';
import { renderFormFieldWith, renderLabel } from 'tinymce/themes/silver/ui/alien/FieldLabeller';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

import { detectSize } from '../alien/FlatgridAutodetect';
import { formActionEvent, formResizeEvent } from '../general/FormEvents';
import * as ItemClasses from '../menus/item/ItemClasses';
import { deriveCollectionMovement } from '../menus/menu/MenuMovement';
import { Omit } from '../Omit';

type CollectionSpec = Omit<Types.Collection.Collection, 'type'>;

export const renderCollection = (spec: CollectionSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  // DUPE with TextField.
  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const runOnItem = <T extends EventFormat>(f: (c: AlloyComponent, se: SimulatedEvent<T>, tgt: Element, itemValue: string) => void) => (comp: AlloyComponent, se: SimulatedEvent<T>) => {
    SelectorFind.closest(se.event().target(), '[data-collection-item-value]').each((target: Element<HTMLElement>) => {
      f(comp, se, target, Attr.get(target, 'data-collection-item-value'));
    });
  };

  const escapeAttribute = (ch) => {
    if (ch === '"') { return '&quot;'; }
    return ch;
  };

  const setContents = (comp, items) => {
    const htmlLines = Arr.map(items, (item) => {
      const itemText = I18n.translate(item.text);
      const textContent = spec.columns === 1 ? `<div class="tox-collection__item-label">${itemText}</div>` : '';

      const iconContent = `<div class="tox-collection__item-icon">${item.icon}</div>`;

      // Replacing the hyphens and underscores in collection items with spaces
      // to ensure the screen readers pronounce the words correctly.
      // This is only for aria purposes. Emoticon and Special Character names will still use _ and - for autocompletion.
      const mapItemName = {
        '_': ' ',
        ' - ': ' ',
        '-': ' '
      };

      // Title attribute is added here to provide tooltips which might be helpful to sighted users.
      // Using aria-label here overrides the Apple description of emojis and special characters in Mac/ MS description in Windows.
      // But if only the title attribute is used instead, the names are read out twice. i.e., the description followed by the item.text.
      const ariaLabel = itemText.replace(/\_| \- |\-/g, (match) => {
        return mapItemName[match];
      });
      return `<div class="tox-collection__item" tabindex="-1" data-collection-item-value="${escapeAttribute(item.value)}" title="${ariaLabel}" aria-label="${ariaLabel}">${iconContent}${textContent}</div>`;
    });

    const chunks = spec.columns > 1 && spec.columns !== 'auto' ? Arr.chunk(htmlLines, spec.columns) : [ htmlLines ];
    const html = Arr.map(chunks, (ch) => {
      return `<div class="tox-collection__group">${ch.join('')}</div>`;
    });

    Html.set(comp.element(), html.join(''));
  };

  const onClick = runOnItem((comp, se, tgt, itemValue) => {
    se.stop();
    AlloyTriggers.emitWith(comp, formActionEvent, {
      name: spec.name,
      value: itemValue
    });
  });

  const collectionEvents = [
    AlloyEvents.run<EventArgs>(NativeEvents.mouseover(), runOnItem((comp, se, tgt) => {
      Focus.focus(tgt);
    })),
    AlloyEvents.run<EventArgs>(NativeEvents.click(), onClick),
    AlloyEvents.run<EventArgs>(SystemEvents.tap(), onClick),
    AlloyEvents.run(NativeEvents.focusin(), runOnItem((comp, se, tgt) => {
      SelectorFind.descendant(comp.element(), '.' + ItemClasses.activeClass).each((currentActive) => {
        Class.remove(currentActive, ItemClasses.activeClass);
      });
      Class.add(tgt, ItemClasses.activeClass);
    })),
    AlloyEvents.run(NativeEvents.focusout(), runOnItem((comp) => {
      SelectorFind.descendant(comp.element(), '.' + ItemClasses.activeClass).each((currentActive) => {
        Class.remove(currentActive, ItemClasses.activeClass);
      });
    })),
    AlloyEvents.runOnExecute(runOnItem((comp, se, tgt, itemValue) => {
      AlloyTriggers.emitWith(comp, formActionEvent, {
        name: spec.name,
        value: itemValue
      });
    }))
  ];

  const pField = AlloyFormField.parts().field({
    dom: {
      tag: 'div',
      // FIX: Read from columns
      classes: [ 'tox-collection' ].concat(spec.columns !== 1 ? [ 'tox-collection--grid' ] : [ 'tox-collection--list' ])
    },
    components: [ ],
    factory: { sketch: Fun.identity },
    behaviours: Behaviour.derive([
      Replacing.config({ }),
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: [ ]
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
    ])
  });

  const extraClasses = ['tox-form__group--collection'];

  return renderFormFieldWith(pLabel, pField, extraClasses, [ ]);
};
