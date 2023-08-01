import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Composing, Form as AlloyForm, GuiFactory, Keying, Receiving, Representing,
  SketchSpec, Tabbar as AlloyTabbar, TabbarTypes, TabSection as AlloyTabSection, Tabstopping
} from '@ephox/alloy';
import { Objects } from '@ephox/boulder';
import { Dialog } from '@ephox/bridge';
import { Arr, Cell, Fun, Merger, Optional } from '@ephox/katamari';

import { toValidValues } from 'tinymce/themes/silver/ui/general/FormValues';
import { interpretInForm } from 'tinymce/themes/silver/ui/general/UiFactory';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import * as DialogTabHeight from '../alien/DialogTabHeight';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import { formTabChangeEvent } from '../general/FormEvents';
import * as NavigableObject from '../general/NavigableObject';

const SendDataToSectionChannel = 'send-data-to-section';
const SendDataToViewChannel = 'send-data-to-view';

export type TabData = Record<string, any>;

type TabPanelSpec = Omit<Dialog.TabPanel, 'type'>;

export const renderTabPanel = (spec: TabPanelSpec, dialogData: Dialog.DialogData, backstage: UiFactoryBackstage): SketchSpec => {
  const storedValue = Cell<TabData>({ });

  const updateDataWithForm = (form: AlloyComponent): void => {
    const formData = Representing.getValue(form);
    const validData = toValidValues(formData).getOr({ });
    const currentData = storedValue.get();
    const newData = Merger.deepMerge(currentData, validData);
    storedValue.set(newData);
  };

  const setDataOnForm = (form: AlloyComponent) => {
    const tabData = storedValue.get();
    Representing.setValue(form, tabData);
  };

  const oldTab = Cell(null);

  const allTabs: TabbarTypes.TabButtonWithViewSpec[] = Arr.map(spec.tabs, (tab) => {
    return {
      value: tab.name,
      dom: {
        tag: 'div',
        classes: [ 'tox-dialog__body-nav-item' ]
      },
      components: [
        GuiFactory.text(backstage.shared.providers.translate(tab.title))
      ],
      view: () => {
        return [
          // Dupe with SilverDialog
          AlloyForm.sketch((parts) => ({
            dom: {
              tag: 'div',
              classes: [ 'tox-form' ]
            },
            components: Arr.map(tab.items, (item) => interpretInForm(parts, item, dialogData, backstage)),
            formBehaviours: Behaviour.derive([
              Keying.config({
                mode: 'acyclic',
                useTabstopAt: Fun.not(NavigableObject.isPseudoStop)
              }),

              AddEventsBehaviour.config('TabView.form.events', [
                AlloyEvents.runOnAttached(setDataOnForm),
                AlloyEvents.runOnDetached(updateDataWithForm)
              ]),
              Receiving.config({
                channels: Objects.wrapAll([
                  {
                    key: SendDataToSectionChannel,
                    value: {
                      onReceive: updateDataWithForm
                    }
                  },
                  {
                    key: SendDataToViewChannel,
                    value: {
                      onReceive: setDataOnForm
                    }
                  }
                ])
              })
            ])
          }))
        ];
      }
    };
  });

  // Assign fixed height or variable height to the tabs
  const tabMode = DialogTabHeight.smartMode(allTabs);

  return AlloyTabSection.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__body' ]
    },

    onChangeTab: (section, button, _viewItems) => {
      const name = Representing.getValue(button);
      AlloyTriggers.emitWith(section, formTabChangeEvent, {
        name,
        oldName: oldTab.get()
      });
      oldTab.set(name);
    },

    tabs: allTabs,

    components: [
      AlloyTabSection.parts.tabbar({
        dom: {
          tag: 'div',
          classes: [ 'tox-dialog__body-nav' ]
        },
        components: [
          AlloyTabbar.parts.tabs({ })
        ],
        markers: {
          tabClass: 'tox-tab',
          selectedClass: 'tox-dialog__body-nav-item--active'
        },

        tabbarBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ])
      }),
      AlloyTabSection.parts.tabview({
        dom: {
          tag: 'div',
          classes: [ 'tox-dialog__body-content' ]
        }
      })
    ],

    selectFirst: tabMode.selectFirst,

    tabSectionBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('tabpanel', tabMode.extraEvents),
      Keying.config({
        mode: 'acyclic'
      }),

      // INVESTIGATE: Is this necessary? Probably used by getCompByName.
      Composing.config({
        // TODO: Think about this
        find: (comp) => Arr.head(AlloyTabSection.getViewItems(comp))
      }),
      RepresentingConfigs.withComp(
        Optional.none(),
        (tsection: AlloyComponent) => {
          // NOTE: Assumes synchronous updating of store.
          tsection.getSystem().broadcastOn([ SendDataToSectionChannel ], { });
          return storedValue.get();
        },
        (tsection: AlloyComponent, value: TabData) => {
          storedValue.set(value);
          tsection.getSystem().broadcastOn([ SendDataToViewChannel ], { });
        }
      )
    ])
  });
};
