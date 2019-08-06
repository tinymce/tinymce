/* tslint:disable:no-console */
import { GuiFactory } from '@ephox/alloy';
import { console } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';

import { identifyButtons } from 'tinymce/themes/silver/ui/toolbar/Integration';
import { setupDemo } from '../components/DemoHelpers';
import Editor from 'tinymce/core/api/Editor';

export default function () {

  const buttons = {
    'alpha': {
      type: 'button',
      icon: 'A',
      onAction: () => {
        console.log('alpha button pressed');
      }
    },
    'alpha.toggle': {
      type: 'togglebutton',
      icon: 'A+',
      onAction: () => {
        console.log('alpha toggle button pressed');
      }
    },
    'beta': {
      type: 'splitbutton',
      text: 'B',
      onAction: () => console.log('beta splitbutton.button pressed'),
      onItemAction: () => console.log('beta splitbutton.item pressed'),
      fetch: (callback) => {
        callback([
          {
            type: 'choiceitem',
            text: 'ChoiceA'
          },
          {
            type: 'choiceitem',
            text: 'ChoiceB'
          }
        ]);
      }
    },
    'gamma': {
      type: 'menubutton',
      text: 'C',
      fetch: (callback) => {
        callback([
          {
            type: 'menuitem',
            text: 'Menu Item 1',
            items: [
              {
                type: 'menuitem',
                text: 'Menu Item 1.1',
                onAction: () => console.log('menuitem.1.1 pressed')
              },
              {
                type: 'menuitem',
                text: 'Menu Item 1.2',
                onAction: () => console.log('menuitem.1.2 pressed')
              }
            ]
          },
          {
            type: 'menuitem',
            text: 'Menu Item 2',
            onAction: () => console.log('menuitem.2 pressed')
          }
        ]);
      }
    }
  };

  const helpers = setupDemo();
  const mockEditor: Editor = {
    on: () => { },
    formatter: {
      canApply: () => true,
      match: () => true,
      remove: () => { },
      apply: () => { }
    },
    focus: () => { },
    undoManager: {
      transact: (f) => f()
    }
  } as any;

  const toolbar = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'demo-toolbar' ],
      styles: {
        'display': 'flex',
        'flex-direction': 'column'
      }
    },
    components: Arr.map([
      { label: 'Button', button: 'alpha' },
      { label: 'ToggleButton', button: 'alpha.toggle' },
      { label: 'SplitButton', button: 'beta' },
      { label: 'StyleButton', button: 'styleselect' }
    ], ({ label, button }) => {
      const groups = identifyButtons(mockEditor, { buttons, toolbar: button }, helpers.extras, Option.none());
      const buttonComponents = Arr.flatten(Arr.map(groups, (group) => group.items));
      return {
        dom: {
          tag: 'div',
          classes: [ ],
          styles: {
            display: 'flex',
            border: '1px solid #ccc'
          }
        },
        components: [
          {
            dom: {
              tag: 'label',
              styles: {
                'margin-right': '3em',
                'display': 'flex',
                'align-items': 'center',
                'padding': '1em'
              },
              innerHtml: label
            }
          },
          {
            dom: {
              tag: 'div',
              classes: [ 'toolbar-row' ],
              styles: {
                'display': 'flex',
                'flex-direction': 'row-reverse',
                'flex-grow': '1',
                'align-items': 'center'
              }
            },
            components: buttonComponents
          }
        ]
      };
    })
  });

  helpers.uiMothership.add(toolbar);
}
