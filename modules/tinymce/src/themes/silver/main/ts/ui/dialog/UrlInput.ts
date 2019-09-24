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
  Composing,
  CustomEvent,
  Disabling,
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
import { Traverse, Attr } from '@ephox/sugar';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { UiFactoryBackstageForUrlInput } from '../../backstage/UrlInputBackstage';
import { renderFormFieldDom, renderLabel } from '../alien/FieldLabeller';
import { formChangeEvent, formSubmitEvent } from '../general/FormEvents';
import * as Icons from '../icons/Icons';
import * as MenuParts from '../menus/menu/MenuParts';
import * as NestedMenus from '../menus/menu/NestedMenus';
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
import { Omit } from '../Omit';
import { renderButton } from '../general/Button';

type UrlInputSpec = Omit<Types.UrlInput.UrlInput, 'type'>;

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

const errorId = Id.generate('aria-invalid');

export const renderUrlInput = (spec: UrlInputSpec, backstage: UiFactoryBackstage, urlBackstage: UiFactoryBackstageForUrlInput): SketchSpec => {
  const providersBackstage = backstage.shared.providers;

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
    inputAttributes: {
      'aria-errormessage': errorId
    },
    minChars: 0,
    responseTime: 0,
    fetch: (input: AlloyComponent) => {
      const items = getItems(spec.filetype, input, urlBackstage);
      const tdata = NestedMenus.build(items, ItemResponse.BUBBLE_TO_SANDBOX, backstage);
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
            onInvalid: (comp: AlloyComponent, err: string) => {
              memInvalidIcon.getOpt(comp).each((invalidComp) => {
                Attr.set(invalidComp.element(), 'title', providersBackstage.translate(err));
              });
            }
          },
          validator: {
            validate: (input) => {
              const urlEntry = Representing.getValue(input);
              return FutureResult.nu((completer) => {
                handler({ type: spec.filetype, url: urlEntry.value }, (validation) => {
                  if (validation.status === 'invalid') {
                    const err = Result.error(validation.message);
                    completer(err);
                  } else {
                    const val = Result.value(validation.message);
                    completer(val);
                  }
                });
              });
            },
            validateOnLoad: false
          }
        })
      ).toArray(),
      [
        Disabling.config({ disabled: spec.disabled }),
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

    lazySink: backstage.shared.getSink,

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

  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage)) as Option<AlloySpec>;

  // TODO: Consider a way of merging with Checkbox.
  const makeIcon = (name, errId: Option<string>, icon = name, label = name) => {
    return ({
      dom: {
        tag: 'div',
        classes: ['tox-icon', 'tox-control-wrap__status-icon-' + name],
        innerHtml: Icons.get(icon, providersBackstage.icons),
        attributes: {
          'title': providersBackstage.translate(label),
          'aria-live': 'polite',
          ...errId.fold(() => ({ }), (id) => ({ id }))
        }
      }
    });
  };

  const memInvalidIcon = Memento.record(
    makeIcon('invalid', Option.some(errorId), 'warning')
  );

  const memStatus = Memento.record({
    dom: {
      tag: 'div',
      classes: ['tox-control-wrap__status-icon-wrap']
    },
    components: [
      // Include the 'valid' and 'unknown' icons here only if they are to be displayed
      memInvalidIcon.asSpec()
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
      components: [pField, memStatus.asSpec()],
      behaviours: Behaviour.derive([
        Disabling.config({ disabled: spec.disabled })
      ])
    }
  );

  const memUrlPickerButton = Memento.record(renderButton({
    name: spec.name,
    icon: Option.some('browse'),
    text: spec.label.getOr(''),
    disabled: spec.disabled,
    primary: false,
    borderless: true
  },  (component) => AlloyTriggers.emit(component, browseUrlEvent), providersBackstage, [], ['tox-browse-url']));

  const controlHWrapper = (): AlloySpec => {
    return {
      dom: {
        tag: 'div',
        classes: ['tox-form__controls-h-stack']
      },
      components: Arr.flatten([
        [memUrlBox.asSpec()],
        optUrlPicker.map(() => memUrlPickerButton.asSpec()).toArray()
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
      Disabling.config({
        disabled: spec.disabled,
        onDisabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.disable);
          memUrlPickerButton.getOpt(comp).each(Disabling.disable);
        },
        onEnabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.enable);
          memUrlPickerButton.getOpt(comp).each(Disabling.enable);
        }
      }),
      AddEventsBehaviour.config('url-input-events', [
        AlloyEvents.run<CustomEvent>(browseUrlEvent, openUrlPicker)
      ])
    ])
  });
};
