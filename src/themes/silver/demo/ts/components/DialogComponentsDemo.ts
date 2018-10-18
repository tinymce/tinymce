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

import * as Icons from '../../../../../themes/silver/main/ts/ui/icons/Icons';
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
import { renderUiLabel, renderUiGroupLabel } from '../../../main/ts/ui/general/UiLabel';
import { setupDemo } from './DemoHelpers';
import { renderCollection } from '../../../main/ts/ui/dialog/Collection';
import { renderCheckbox } from 'tinymce/themes/silver/ui/general/Checkbox';

// tslint:disable:no-console

const helpers = setupDemo();

const sharedBackstage: UiFactoryBackstageShared = {
  getSink: helpers.extras.backstage.shared.getSink,
  providers: helpers.extras.backstage.shared.providers,
  interpreter: (x) => x
};

export default () => {

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
    // TODO: Implement
    colspan: Option.none(),
    sandboxed: true,
    flex: false
  });

  const inputSpec = renderInput({
    name: 'input',
    label: Option.some('Beta'),
    validation: Option.some({
      validator: (s) => s === 'bad' ? 'Bad' : true
    })
  });

  const textareaSpec = renderTextarea({
    name: 'textarea',
    label: Option.some('Gamma'),
    flex: true,
    validation: Option.some({
      validator: (s) => s === 'so bad' ? 'So bad' : true
    })
  });

  const makeItem = (text: string): Menu.MenuItemApi => {
    return {
      type: 'menuitem',
      value: Id.generate('item'),
      text,
      onAction: () => console.log('clicked: ' + text)
    };
  };

  const labelGroupSpec = renderUiGroupLabel({
    label: 'A label that wraps compontents in a group',
    items: [
      renderCheckbox({
        label: 'check box item 1',
        name: 'one'
      }, sharedBackstage.providers),
      renderCheckbox({
        label: 'check box item 2',
        name: 'two'
      }, sharedBackstage.providers),
      renderInput({
        label: Option.some('exampleInput'),
        name: 'exampleinputfieldname',
        validation: Option.none()
      })
    ]
  }, sharedBackstage);

  const uiLabelSpec = renderUiLabel({
    label: 'A stand alone label'
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
  });

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
      }) as any
    ]
  }, sharedBackstage);

  const buttonSpec = renderButton({
    name: 'button1',
    text: 'Text',
    primary: false
  }, () => {
    console.log('clicked on the button');
  });

  const checkboxSpec = (() => {
    const memBodyPanel = Memento.record(
      renderBodyPanel({
        items: [
          { type: 'checkbox', name: 'checked', label: 'Checked' },
          { type: 'checkbox', name: 'unchecked', label: 'Unchecked' },
          { type: 'checkbox', name: 'indeterminate', label: 'Indeterminate' }
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
            checked: 'checked',
            unchecked: 'unchecked',
            indeterminate: 'indeterminate'
          });
        })
      ])
    };
  })();

  // This is fake because ColorInputBackstage requires Editor constructor
  const fakecolorinputBackstage = {
    colorPicker: Fun.noop,
    hasCustomColors: Fun.constant(false)
  };

  const colorInputSpec = renderColorInput({
    type: 'colorinput',
    name: 'colorinput-demo',
    colspan: Option.none(),
    label: Option.some('Color input label')
  }, sharedBackstage, fakecolorinputBackstage);

  const colorPickerSpec = renderColorPicker({
    type: 'colorpicker',
    name: 'colorpicker-demo',
    colspan: Option.none(),
    label: Option.some('Color picker label')
  });

  const dropzoneSpec = renderDropZone({
    type: 'dropzone',
    flex: false,
    name: 'dropzone-demo',
    colspan: Option.none(),
    label: Option.some('Dropzone label')
  });

  const selectBoxSpec = renderSelectBox({
    type: 'selectbox',
    name: 'selectbox-demo',
    size: 1,
    colspan: Option.none(),
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
    colspan: Option.none(),
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
    label: Option.none(),
    colspan: Option.none(),
  }, sharedBackstage.providers);

  const urlInputSpec = renderUrlInput({
    type: 'urlinput',
    name: 'blah',
    colspan: Option.none(),
    label: Option.some('Url'),
    filetype: 'image' // 'image' || 'media'
  }, helpers.extras.backstage.shared, helpers.extras.backstage.urlinput);

  const linkInputSpec = renderTypeahead({
    label: Option.some('Url'),
    name: 'linkInput',
    icon: 'icon-embed',
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
    icon: Icons.get('icon-close', sharedBackstage.providers.icons),
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
      colspan: Option.none()
    })
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

      display('Group Label', labelGroupSpec),
      display('Ui Label', uiLabelSpec),
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