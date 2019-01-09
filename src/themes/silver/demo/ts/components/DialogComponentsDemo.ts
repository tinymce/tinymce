import {
  AlloyEvents,
  DomFactory,
  GuiFactory,
  Input as AlloyInput,
  Memento,
  Representing,
  SimpleSpec,
} from '@ephox/alloy';
import { Menu, Types } from '@ephox/bridge';
import { ValueSchema } from '@ephox/boulder';
import { Arr, Id, Option, Fun } from '@ephox/katamari';
import { renderAlertBanner } from 'tinymce/themes/silver/ui/general/AlertBanner';

import { renderAutocomplete } from '../../../main/ts/ui/dialog/Autocomplete';
import { renderBodyPanel } from '../../../main/ts/ui/dialog/BodyPanel';
import { renderColorInput } from '../../../main/ts/ui/dialog/ColorInput';
import { renderColorPicker } from '../../../main/ts/ui/dialog/ColorPicker';
import { renderCustomEditor } from '../../../main/ts/ui/dialog/CustomEditor';
import { renderDropZone } from '../../../main/ts/ui/dialog/Dropzone';
import { renderGrid } from '../../../main/ts/ui/dialog/Grid';
import { renderIFrame } from '../../../main/ts/ui/dialog/IFrame';
import { renderSelectBox } from '../../../main/ts/ui/dialog/SelectBox';
import { renderSizeInput } from '../../../main/ts/ui/dialog/SizeInput';
import { renderInput, renderTextarea } from '../../../main/ts/ui/dialog/TextField';
import { renderTypeahead } from '../../../main/ts/ui/dialog/TypeAheadInput';
import { renderUrlInput } from '../../../main/ts/ui/dialog/UrlInput';
import { renderButton } from '../../../main/ts/ui/general/Button';
import { renderListbox } from '../../../main/ts/ui/general/Listbox';
import { UiFactoryBackstageShared } from '../../../main/ts/backstage/Backstage';
import { renderLabel } from '../../../main/ts/ui/dialog/Label';
import { setupDemo } from './DemoHelpers';
import { renderCollection } from '../../../main/ts/ui/dialog/Collection';
import { renderCheckbox } from '../../../main/ts/ui/general/Checkbox';

// tslint:disable:no-console

export default () => {
  const helpers = setupDemo();

  const sharedBackstage: UiFactoryBackstageShared = {
    getSink: helpers.extras.backstage.shared.getSink,
    providers: helpers.extras.backstage.shared.providers,
    interpreter: (x) => x
  };

  const autocompleteSpec = renderAutocomplete({
    name: 'alpha',
    initialValue: '',
    label: Option.some('Alpha'),
    getItems: (value) => {
      return Arr.map([
        {
          text: 'Cat'
        },
        {
          text: 'Dog'
        }
      ], (d) => makeItem(d.text));
    }
  }, sharedBackstage);

  const iframeSpec = renderIFrame({
    type: 'iframe',
    name: 'iframe',
    label: Option.some('Iframe'),
    sandboxed: true
  }, sharedBackstage.providers);

  const inputSpec = renderInput({
    name: 'input',
    label: Option.some('Beta'),
    placeholder: Option.none(),
    validation: Option.some({
      validator: (s) => s === 'bad' ? 'Bad' : true
    })
  }, sharedBackstage.providers);

  const textareaSpec = renderTextarea({
    name: 'textarea',
    label: Option.some('Gamma'),
    placeholder: Option.none(),
    validation: Option.some({
      validator: (s) => s === 'so bad' ? 'So bad' : true
    })
  }, sharedBackstage.providers);

  const makeItem = (text: string): Menu.MenuItemApi => {
    return {
      type: 'menuitem',
      value: Id.generate('item'),
      text,
      onAction: () => console.log('clicked: ' + text)
    };
  };

  const labelSpec = renderLabel({
    label: 'A label wraps components in a group',
    type: 'label',
    items: [
      renderCheckbox({
        label: 'check box item 1',
        name: 'one'
      }, sharedBackstage.providers) as any,
      renderCheckbox({
        label: 'check box item 2',
        name: 'two'
      }, sharedBackstage.providers) as any,
      renderInput({
        label: Option.some('Sample input'),
        placeholder: Option.none(),
        name: 'exampleinputfieldname',
        validation: Option.none()
      }, sharedBackstage.providers) as any
    ]
  }, sharedBackstage);

  const labelGridSpec = renderLabel({
    label: 'A label wraps a grid compontent',
    type: 'label',
    items: [
      renderGrid({
        type: 'grid',
        columns: 2,
        items: [
          renderButton({
            name: 'gridspecbutton',
            text: 'Click Me!',
            primary: false
          }, () => {
            console.log('clicked on the button in the grid wrapped by a label');
          }, sharedBackstage.providers) as any,
          renderCheckbox({
            label: 'check box item 1',
            name: 'one'
          }, sharedBackstage.providers) as any,
          renderCheckbox({
            label: 'check box item 2',
            name: 'two'
          }, sharedBackstage.providers) as any,
          renderInput({
            label: Option.some('Sample input'),
            placeholder: Option.none(),
            name: 'exampleinputfieldname',
            validation: Option.none()
          }, sharedBackstage.providers) as any
        ]
      }, sharedBackstage) as any
    ]
  }, sharedBackstage);

  const listboxSpec = renderListbox({
    name: 'listbox1',
    label: 'Listbox',
    values: [
      { value: 'alpha', text: 'Alpha' },
      { value: 'beta', text: 'Beta' },
      { value: 'gamma', text: 'Gamma' }
    ],
    initialValue: Option.some('beta')
  }, sharedBackstage.providers);

  const gridSpec = renderGrid({
    type: 'grid',
    columns: 5,
    items: [
      AlloyInput.sketch({ inputAttributes: { placeholder: 'Text goes here...' } }) as any,
      renderButton({
        name: 'gridspecbutton',
        text: 'Click Me!',
        primary: false
      }, () => {
        console.log('clicked on the button in the grid');
      }, sharedBackstage.providers) as any
    ]
  }, sharedBackstage);

  const buttonSpec = renderButton({
    name: 'button1',
    text: 'Text',
    primary: false
  }, () => {
    console.log('clicked on the button');
  }, sharedBackstage.providers);

  const checkboxSpec = (() => {
    const memBodyPanel = Memento.record(
      renderBodyPanel({
        items: [
          { type: 'checkbox', name: 'checked', label: 'Checked' },
          { type: 'checkbox', name: 'unchecked', label: 'Unchecked' }
        ]
      }, {
        shared: sharedBackstage
      })
    );

    return {
      dom: {
        tag: 'div'
      },
      components: [
        memBodyPanel.asSpec(),
      ],
      events: AlloyEvents.derive([
        AlloyEvents.runOnAttached((component) => {
          const body = memBodyPanel.get(component);
          Representing.setValue(body, {
            checked: true,
            unchecked: false
          });
        })
      ])
    };
  })();

  const choiceItem: 'choiceitem' = 'choiceitem';

  // This is fake because ColorInputBackstage requires Editor constructor
  const fakecolorinputBackstage = {
    colorPicker: Fun.noop,
    hasCustomColors: Fun.constant(false),
    getColors: () => [
      { type: choiceItem, text: 'Turquoise', value: '#18BC9B' },
      { type: choiceItem, text: 'Green', value: '#2FCC71' },
      { type: choiceItem, text: 'Blue', value: '#3598DB' },
      { type: choiceItem, text: 'Purple', value: '#9B59B6' },
      { type: choiceItem, text: 'Navy Blue', value: '#34495E' },

      { type: choiceItem, text: 'Dark Turquoise', value: '#18A085' },
      { type: choiceItem, text: 'Dark Green', value: '#27AE60' },
      { type: choiceItem, text: 'Medium Blue', value: '#2880B9' },
      { type: choiceItem, text: 'Medium Purple', value: '#8E44AD' },
      { type: choiceItem, text: 'Midnight Blue', value: '#2B3E50' },

      { type: choiceItem, text: 'Yellow', value: '#F1C40F' },
      { type: choiceItem, text: 'Orange', value: '#E67E23' },
      { type: choiceItem, text: 'Red', value: '#E74C3C' },
      { type: choiceItem, text: 'Light Gray', value: '#ECF0F1' },
      { type: choiceItem, text: 'Gray', value: '#95A5A6' },

      { type: choiceItem, text: 'Dark Yellow', value: '#F29D12' },
      { type: choiceItem, text: 'Dark Orange', value: '#D35400' },
      { type: choiceItem, text: 'Dark Red', value: '#E74C3C' },
      { type: choiceItem, text: 'Medium Gray', value: '#BDC3C7' },
      { type: choiceItem, text: 'Dark Gray', value: '#7E8C8D' },

      { type: choiceItem, text: 'Black', value: '#000000' },
      { type: choiceItem, text: 'White', value: '#ffffff' }
    ]
  };

  const colorInputSpec = renderColorInput({
    type: 'colorinput',
    name: 'colorinput-demo',
    label: Option.some('Color input label')
  }, sharedBackstage, fakecolorinputBackstage);

  const colorPickerSpec = renderColorPicker({
    type: 'colorpicker',
    name: 'colorpicker-demo',
    label: Option.some('Color picker label')
  });

  const dropzoneSpec = renderDropZone({
    type: 'dropzone',
    name: 'dropzone-demo',
    label: Option.some('Dropzone label')
  }, sharedBackstage.providers);

  const selectBoxSpec = renderSelectBox({
    type: 'selectbox',
    name: 'selectbox-demo',
    size: 1,
    label: Option.some('Select one from'),
    items: [
      { value: 'one', text: 'One' },
      { value: 'two', text: 'Two' }
    ]
  }, sharedBackstage.providers);

  const selectBoxSizeSpec = renderSelectBox({
    type: 'selectbox',
    name: 'selectbox-demo',
    size: 6,
    label: Option.some('Select one from'),
    items: [
      { value: 'one', text: 'One' },
      { value: 'two', text: 'Two' },
      { value: 'three', text: 'Three' },
      { value: 'four', text: 'Four' },
      { value: 'five', text: 'Five' },
      { value: 'six', text: 'Six' }
    ]
  }, sharedBackstage.providers);

  const sizeInputSpec = renderSizeInput({
    constrain: true,
    type: 'sizeinput',
    name: 'sizeinput-demo',
    label: Option.some('kustom fixed ratio'),
  }, sharedBackstage.providers);

  const urlInputSpec = renderUrlInput({
    type: 'urlinput',
    name: 'blah',
    label: Option.some('Url'),
    filetype: 'image' // 'image' || 'media'
  }, helpers.extras.backstage.shared, helpers.extras.backstage.urlinput);

  const linkInputSpec = renderTypeahead({
    label: Option.some('Url'),
    name: 'linkInput',
    icon: 'embed',
    initialValue: '',
    getItems: (value) => {
      return Arr.map([
        {
          value: 'https://www.tinymce.com',
          text: 'My page 1'
        },
        {
          value: 'https://www.ephox.com',
          text: 'My page 2'
        }
      ], (d) => makeItem(d.text));
    }
  }, sharedBackstage);

  const customEditorSpec = renderCustomEditor({
      tag: 'textarea',
      init: (el) => new Promise((resolve) => {
        const oldEl = el;
        const newEl = el.ownerDocument.createElement('span');
        newEl.innerText = 'this is a custom editor';
        el.parentElement.replaceChild(newEl, oldEl);

        const api = {
          getValue: () => newEl.innerText,
          setValue: (value) => {
            newEl.innerText = value;
          },
          destroy: () => { newEl.parentElement.replaceChild(oldEl, newEl); }        };

        resolve(api);
      }),
    });

  const alertBannerSpec = renderAlertBanner({
    text: 'The alert banner message',
    level: 'warn',
    icon: 'close',
    actionLabel: 'Click here For somthing'
  }, sharedBackstage.providers);

  const display = (label: string, spec: SimpleSpec) => {
    return {
      dom: {
        tag: 'div',
        styles: { border: '1px solid #aaa', margin: '1em', padding: '1em' }
      },
      components: [
        { dom: DomFactory.fromHtml('<h3>' + label + '</h3>') },
        { dom: { tag: 'hr' } },
        spec
      ]
    };
  };

  const memCollection = Memento.record(
    renderCollection({
      type: 'collection',
      columns: 1,
      name: 'collection',
      label: Option.some('Collection: '),
    }, sharedBackstage.providers)
  );

  const everything = GuiFactory.build({
    dom: {
      tag: 'div'
    },
    components: [
      display('Collection', memCollection.asSpec()),
      display('Dropzone', dropzoneSpec),
      display('UrlInput', urlInputSpec),
      display('LinkTypeAheadInput', linkInputSpec),
      display('SizeInput', sizeInputSpec),
      display('SelectBox', selectBoxSpec),
      display('SelectBox with Size', selectBoxSizeSpec),
      display('Grid', gridSpec),
      display('ColorPicker', colorPickerSpec),
      display('ColorInput', colorInputSpec),
      display('Checkbox', checkboxSpec),
      display('Button', buttonSpec),
      display('Listbox', listboxSpec),
      display('Label', labelSpec),
      display('Grid Label', labelGridSpec),
      display('Autocomplete', autocompleteSpec),
      display('IFrame', iframeSpec),
      display('Input', inputSpec),
      display('Textarea', textareaSpec),
      display('CodeView', customEditorSpec),
      display('AlertBanner', alertBannerSpec)
    ]
  });

  helpers.uiMothership.add(everything);
  memCollection.getOpt(everything).each((collection) => {
    Representing.setValue(collection,
      ValueSchema.asRawOrDie('dialogComponentsDemo.collection', Types.Collection.collectionDataProcessor, [
        {
          value: 'a',
          text: 'A'
        },
        {
          value: 'b',
          text: 'B'
        },
        {
          value: 'c',
          text: 'C'
        },
        {
          value: 'd',
          text: 'D'
        }
      ])
    );
  });
};