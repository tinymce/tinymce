/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloySpec,
  AlloyTriggers,
  Behaviour,
  Button as AlloyButton,
  Composing,
  CustomEvent,
  FormField as AlloyFormField,
  Invalidating,
  Memento,
  NativeEvents,
  Representing,
  SketchSpec,
  Tabstopping,
  Typeahead as AlloyTypeahead,
  AlloyComponent,
  SystemEvents
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Arr, Future, FutureResult, Id, Option, Result, Fun } from '@ephox/katamari';
import { Class, Traverse } from '@ephox/sugar';

import { UiFactoryBackstageShared, UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { UiFactoryBackstageForUrlInput } from '../../backstage/UrlInputBackstage';
import { renderFormFieldDom, renderLabel } from '../alien/FieldLabeller';
import { formChangeEvent, formSubmitEvent } from '../general/FormEvents';
import * as Icons from '../icons/Icons';
import * as MenuParts from '../menus/menu/MenuParts';
import * as NestedMenus from '../menus/menu/NestedMenus';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';
import {
  anchorTargetBottom,
  anchorTargets,
  anchorTargetTop,
  filterByQuery,
  headerTargets,
  historyTargets,
  joinMenuLists,
} from '../urlinput/Completions';
import ItemResponse from '../menus/item/ItemResponse';

const getItems = (fileType: 'image' | 'media' | 'file', input: AlloyComponent, urlBackstage: UiFactoryBackstageForUrlInput) => {
  const urlInputValue = Representing.getValue(input);
  const term = urlInputValue.meta.text !== undefined ? urlInputValue.meta.text : urlInputValue.value;
  const info = urlBackstage.getLinkInformation();
  return info.fold(
    () => [],
    (linkInfo) => {
      const history = filterByQuery(term, historyTargets(urlBackstage.getHistory(fileType)));
      return fileType === 'file' ? joinMenuLists([
        history,
        filterByQuery(term, headerTargets(linkInfo)),
        filterByQuery(term, Arr.flatten([
          anchorTargetTop(linkInfo),
          anchorTargets(linkInfo),
          anchorTargetBottom(linkInfo)
        ]))
      ])
        : history;
    }
  );
};

// TODO: Find a place for this.
const renderInputButton = (label: Option<string>, eventName: string, className: string, iconName: string, providersBackstage: UiFactoryBackstageProviders) => {
  return AlloyButton.sketch({
    dom: {
      tag: 'button',
      classes: [ ToolbarButtonClasses.Button, className ],
      innerHtml: Icons.get(iconName, providersBackstage.icons),
      attributes: {
        title: providersBackstage.translate(label.getOr('')) // TODO: tooltips AP-213
      }
    },
    buttonBehaviours: Behaviour.derive([
      Tabstopping.config({})
    ]),
    action: (component) => {
      AlloyTriggers.emit(component, eventName);
    }
  });
};

export const renderUrlInput = (spec: Types.UrlInput.UrlInput, sharedBackstage: UiFactoryBackstageShared, urlBackstage: UiFactoryBackstageForUrlInput): SketchSpec => {

  const updateHistory = (component: AlloyComponent): void => {
    const urlEntry = Representing.getValue(component);
    urlBackstage.addToHistory(urlEntry.value, spec.filetype);
  };

  // TODO: Make alloy's typeahead only swallow enter and escape if menu is open
  const pField = AlloyFormField.parts().field({
    factory: AlloyTypeahead,
    dismissOnBlur: true,
    inputClasses: ['tox-textfield'],
    sandboxClasses: ['tox-dialog__popups'],
    minChars: 0,
    responseTime: 0,
    fetch: (input: AlloyComponent) => {
      const items = getItems(spec.filetype, input, urlBackstage);
      const tdata = NestedMenus.build(items, ItemResponse.BUBBLE_TO_SANDBOX, sharedBackstage.providers);
      return Future.pure(tdata);
    },

    getHotspot: (comp) => memUrlBox.getOpt(comp),
    onSetValue: (comp, newValue) => {
      if (comp.hasConfigured(Invalidating)) {
        Invalidating.run(comp).get(Fun.noop);
      }
    },

    typeaheadBehaviours: Behaviour.derive(Arr.flatten([
      urlBackstage.getValidationHandler().map(
        (handler) => Invalidating.config({
          getRoot: (comp) => Traverse.parent(comp.element()),
          invalidClass: 'tox-control-wrap--status-invalid',
          notify: {
          },
          validator: {
            validate: (input) => {
              const urlEntry = Representing.getValue(input);
              return FutureResult.nu((completer) => {
                handler({ type: spec.filetype, url: urlEntry.value }, (validation) => {
                  memUrlBox.getOpt(input).each((urlBox) => {
                    // TODO: Move to UrlIndicator
                    const toggle = (component: AlloyComponent, clazz: string, b: boolean) => {
                      (b ? Class.add : Class.remove)(component.element(), clazz);
                    };
                    // TODO handle the aria implications of the other 3 states
                    toggle(urlBox, 'tox-control-wrap--status-valid', validation.status === 'valid');
                    toggle(urlBox, 'tox-control-wrap--status-unknown', validation.status === 'unknown');
                  });
                  completer((validation.status === 'invalid' ? Result.error : Result.value)(validation.message));
                });
              });
            },
            validateOnLoad: false
          }
        })
      ).toArray(),
      [
        Tabstopping.config({}),
        AddEventsBehaviour.config('urlinput-events', Arr.flatten([
          // We want to get fast feedback for the link dialog, but not sure about others
          spec.filetype === 'file' ? [
            AlloyEvents.run(NativeEvents.input(), (comp) => {
              AlloyTriggers.emitWith(comp, formChangeEvent, { name: spec.name });
            })
          ] : [ ],
          [
            AlloyEvents.run(NativeEvents.change(), (comp) => {
              AlloyTriggers.emitWith(comp, formChangeEvent, { name: spec.name });
              updateHistory(comp);
            }),
            AlloyEvents.run(SystemEvents.postPaste(), (comp) => {
              AlloyTriggers.emitWith(comp, formChangeEvent, { name: spec.name });
              updateHistory(comp);
            })
          ]
        ]))
      ]
    ])),

    eventOrder: {
      [NativeEvents.input()]: [ 'streaming', 'urlinput-events', 'invalidating' ]
    },

    model: {
      getDisplayText: (itemData) => {
        return itemData.value;
      },
      selectsOver: false,
      populateFromBrowse: false
    },

    markers: {
      // FIX:
      openClass: 'dog'
    },

    lazySink: sharedBackstage.getSink,

    parts: {
      menu: MenuParts.part(false, 1, 'normal')
    },
    onExecute: (_menu, component, _entry) => {
      AlloyTriggers.emitWith(component, formSubmitEvent, {});
    },
    onItemExecute: (typeahead, _sandbox, _item, _value) => {
      updateHistory(typeahead);
      AlloyTriggers.emitWith(typeahead, formChangeEvent, { name: spec.name });
    }
  });

  const pLabel = spec.label.map((label) => renderLabel(label, sharedBackstage.providers)) as Option<AlloySpec>;

  // TODO: Consider a way of merging with Checkbox.
  const makeIcon = (name, icon = name, label = name) => {
    // TODO: Aria this, most likley be an aria live because its dynamic
    return ({
      dom: {
        tag: 'div',
        classes: ['tox-icon', 'tox-control-wrap__status-icon-' + name],
        innerHtml: Icons.get(icon, sharedBackstage.providers.icons),
        attributes: {
          title: sharedBackstage.providers.translate(label)   // TODO: tooltips AP-213
        }
      }
    });
  };

  const memStatus = Memento.record({
    dom: {
      tag: 'div',
      classes: ['tox-control-wrap__status-icon-wrap']
    },
    components: [
      makeIcon('valid', 'checkmark',  'valid'),
      makeIcon('unknown', 'warning'),
      makeIcon('invalid', 'warning')
    ]
  });

  const optUrlPicker = urlBackstage.getUrlPicker(spec.filetype);

  const browseUrlEvent = Id.generate('browser.url.event');

  const memUrlBox = Memento.record(
    {
      dom: {
        tag: 'div',
        classes: ['tox-control-wrap']
      },
      components: [pField, memStatus.asSpec()]
    }
  );

  const controlHWrapper = (): AlloySpec => {
    return {
      dom: {
        tag: 'div',
        classes: ['tox-form__controls-h-stack']
      },
      components: Arr.flatten([
        [memUrlBox.asSpec()],
        optUrlPicker.map(() => renderInputButton(spec.label, browseUrlEvent, 'tox-browse-url', 'browse', sharedBackstage.providers)).toArray()
      ])
    };
  };

  const openUrlPicker = (comp: AlloyComponent) => {
    Composing.getCurrent(comp).each((field) => {
      const urlData = Representing.getValue(field);
      optUrlPicker.each((picker) => {
        picker(urlData).get((chosenData) => {
          Representing.setValue(field, chosenData);
          AlloyTriggers.emitWith(comp, formChangeEvent, { name: spec.name });
        });
      });
    });
  };

  return AlloyFormField.sketch({
    dom: renderFormFieldDom(),
    components: pLabel.toArray().concat([
      controlHWrapper()
    ]),
    fieldBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('url-input-events', [
        AlloyEvents.run<CustomEvent>(browseUrlEvent, openUrlPicker)
      ])
    ])
  });
};
