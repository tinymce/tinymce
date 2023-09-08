import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, Composing, CustomEvent, Disabling, FormField as AlloyFormField,
  Invalidating, Memento, NativeEvents, Representing, SketchSpec, SimpleSpec, SystemEvents, Tabstopping, Typeahead as AlloyTypeahead
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Fun, Future, FutureResult, Id, Optional, Result } from '@ephox/katamari';
import { Attribute, Traverse, Value } from '@ephox/sugar';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { UiFactoryBackstageForUrlInput } from '../../backstage/UrlInputBackstage';
import * as ReadOnly from '../../ReadOnly';
import { renderFormFieldDom, renderLabel } from '../alien/FieldLabeller';
import { renderButton } from '../general/Button';
import { formChangeEvent, formSubmitEvent } from '../general/FormEvents';
import * as Icons from '../icons/Icons';
import ItemResponse from '../menus/item/ItemResponse';
import * as MenuParts from '../menus/menu/MenuParts';
import * as NestedMenus from '../menus/menu/NestedMenus';
import {
  anchorTargetBottom, anchorTargets, anchorTargetTop, filterByQuery, headerTargets, historyTargets, joinMenuLists
} from '../urlinput/Completions';

type UrlInputSpec = Omit<Dialog.UrlInput, 'type'>;

const getItems = (fileType: 'image' | 'media' | 'file', input: AlloyComponent, urlBackstage: UiFactoryBackstageForUrlInput) => {
  const urlInputValue = Representing.getValue(input);
  const term = urlInputValue?.meta?.text ?? urlInputValue.value;
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

export const renderUrlInput = (
  spec: UrlInputSpec,
  backstage: UiFactoryBackstage,
  urlBackstage: UiFactoryBackstageForUrlInput,
  initialData: Optional<Dialog.UrlInputData>
): SketchSpec => {
  const providersBackstage = backstage.shared.providers;

  const updateHistory = (component: AlloyComponent): void => {
    const urlEntry = Representing.getValue(component);
    urlBackstage.addToHistory(urlEntry.value, spec.filetype);
  };

  // TODO: Make alloy's typeahead only swallow enter and escape if menu is open
  const typeaheadSpec: Parameters<typeof AlloyTypeahead['sketch']>[0] = {
    ...initialData.map((initialData) => ({ initialData })).getOr({}),
    dismissOnBlur: true,
    inputClasses: [ 'tox-textfield' ],
    sandboxClasses: [ 'tox-dialog__popups' ],
    inputAttributes: {
      'aria-errormessage': errorId,
      'type': 'url'
    },
    minChars: 0,
    responseTime: 0,
    fetch: (input) => {
      const items = getItems(spec.filetype, input, urlBackstage);
      const tdata = NestedMenus.build(
        items,
        ItemResponse.BUBBLE_TO_SANDBOX,
        backstage,
        {
          isHorizontalMenu: false,
          search: Optional.none()
        }
      );
      return Future.pure(tdata);
    },

    getHotspot: (comp) => memUrlBox.getOpt(comp),
    onSetValue: (comp, _newValue) => {
      if (comp.hasConfigured(Invalidating)) {
        Invalidating.run(comp).get(Fun.noop);
      }
    },

    typeaheadBehaviours: Behaviour.derive([
      ...urlBackstage.getValidationHandler().map(
        (handler) => Invalidating.config({
          getRoot: (comp) => Traverse.parentElement(comp.element),
          invalidClass: 'tox-control-wrap--status-invalid',
          notify: {
            onInvalid: (comp: AlloyComponent, err: string) => {
              memInvalidIcon.getOpt(comp).each((invalidComp) => {
                Attribute.set(invalidComp.element, 'title', providersBackstage.translate(err));
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
      Disabling.config({
        disabled: () => !spec.enabled || providersBackstage.isDisabled()
      }),
      Tabstopping.config({}),
      AddEventsBehaviour.config('urlinput-events',
        // We want to get fast feedback for the link dialog, but not sure about others
        [
          AlloyEvents.run(NativeEvents.input(), (comp) => {
            const currentValue = Value.get(comp.element);
            const trimmedValue = currentValue.trim();
            if (trimmedValue !== currentValue) {
              Value.set(comp.element, trimmedValue);
            }

            if (spec.filetype === 'file') {
              AlloyTriggers.emitWith(comp, formChangeEvent, { name: spec.name });
            }
          }),
          AlloyEvents.run(NativeEvents.change(), (comp) => {
            AlloyTriggers.emitWith(comp, formChangeEvent, { name: spec.name });
            updateHistory(comp);
          }),
          AlloyEvents.run(SystemEvents.postPaste(), (comp) => {
            AlloyTriggers.emitWith(comp, formChangeEvent, { name: spec.name });
            updateHistory(comp);
          })
        ]
      )
    ]),

    eventOrder: {
      [NativeEvents.input()]: [ 'streaming', 'urlinput-events', 'invalidating' ]
    },

    model: {
      getDisplayText: (itemData) => itemData.value,
      selectsOver: false,
      populateFromBrowse: false
    },

    markers: {
      openClass: 'tox-textfield--popup-open'
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
  };
  const pField = AlloyFormField.parts.field({
    ...typeaheadSpec,
    factory: AlloyTypeahead
  });

  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  // TODO: Consider a way of merging with Checkbox.
  const makeIcon = (name: string, errId: Optional<string>, icon: string = name, label: string = name): SimpleSpec =>
    Icons.render(icon, {
      tag: 'div',
      classes: [ 'tox-icon', 'tox-control-wrap__status-icon-' + name ],
      attributes: {
        'title': providersBackstage.translate(label),
        'aria-live': 'polite',
        ...errId.fold(() => ({}), (id) => ({ id }))
      }
    }, providersBackstage.icons);

  const memInvalidIcon = Memento.record(
    makeIcon('invalid', Optional.some(errorId), 'warning')
  );

  const memStatus = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-control-wrap__status-icon-wrap' ]
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
        classes: [ 'tox-control-wrap' ]
      },
      components: [ pField, memStatus.asSpec() ],
      behaviours: Behaviour.derive([
        Disabling.config({
          disabled: () => !spec.enabled || providersBackstage.isDisabled()
        })
      ])
    }
  );

  const memUrlPickerButton = Memento.record(renderButton({
    name: spec.name,
    icon: Optional.some('browse'),
    text: spec.picker_text.or(spec.label).getOr(''),
    enabled: spec.enabled,
    primary: false,
    buttonType: Optional.none(),
    borderless: true
  }, (component) => AlloyTriggers.emit(component, browseUrlEvent), providersBackstage, [], [ 'tox-browse-url' ]));

  const controlHWrapper = (): AlloySpec => ({
    dom: {
      tag: 'div',
      classes: [ 'tox-form__controls-h-stack' ]
    },
    components: Arr.flatten([
      [ memUrlBox.asSpec() ],
      optUrlPicker.map(() => memUrlPickerButton.asSpec()).toArray()
    ])
  });

  const openUrlPicker = (comp: AlloyComponent) => {
    Composing.getCurrent(comp).each((field) => {
      const componentData = Representing.getValue(field);
      const urlData = {
        fieldname: spec.name,
        ...componentData
      };
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
        disabled: () => !spec.enabled || providersBackstage.isDisabled(),
        onDisabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.disable);
          memUrlPickerButton.getOpt(comp).each(Disabling.disable);
        },
        onEnabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.enable);
          memUrlPickerButton.getOpt(comp).each(Disabling.enable);
        }
      }),
      ReadOnly.receivingConfig(),
      AddEventsBehaviour.config('url-input-events', [
        AlloyEvents.run<CustomEvent>(browseUrlEvent, openUrlPicker)
      ])
    ])
  });
};
