import { AlloyEvents, DomFactory, GuiFactory, Input as AlloyInput, Memento, Representing, SimpleSpec } from '@ephox/alloy';
import { ValueSchema } from '@ephox/boulder';
import { Types } from '@ephox/bridge';
import { console } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { UiFactoryBackstage, UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { renderBodyPanel } from 'tinymce/themes/silver/ui/dialog/BodyPanel';
import { renderCollection } from 'tinymce/themes/silver/ui/dialog/Collection';
import { renderColorInput } from 'tinymce/themes/silver/ui/dialog/ColorInput';
import { renderColorPicker } from 'tinymce/themes/silver/ui/dialog/ColorPicker';
import { renderCustomEditor } from 'tinymce/themes/silver/ui/dialog/CustomEditor';
import { renderDropZone } from 'tinymce/themes/silver/ui/dialog/Dropzone';
import { renderGrid } from 'tinymce/themes/silver/ui/dialog/Grid';
import { renderIFrame } from 'tinymce/themes/silver/ui/dialog/IFrame';
import { renderLabel } from 'tinymce/themes/silver/ui/dialog/Label';
import { renderSelectBox } from 'tinymce/themes/silver/ui/dialog/SelectBox';
import { renderSizeInput } from 'tinymce/themes/silver/ui/dialog/SizeInput';
import { renderInput, renderTextarea } from 'tinymce/themes/silver/ui/dialog/TextField';
import { renderUrlInput } from 'tinymce/themes/silver/ui/dialog/UrlInput';

import { renderAlertBanner } from 'tinymce/themes/silver/ui/general/AlertBanner';
import { renderButton } from 'tinymce/themes/silver/ui/general/Button';
import { renderCheckbox } from 'tinymce/themes/silver/ui/general/Checkbox';
import { setupDemo } from './DemoHelpers';

// tslint:disable:no-console

export default () => {
  const helpers = setupDemo();

  const backstage: UiFactoryBackstage = helpers.extras.backstage;
  const sharedBackstage: UiFactoryBackstageShared = {
    getSink: helpers.extras.backstage.shared.getSink,
    providers: helpers.extras.backstage.shared.providers,
    interpreter: (x) => x
  };

  const iframeSpec = renderIFrame({
    name: 'iframe',
    label: Option.some('Iframe'),
    sandboxed: true
  }, sharedBackstage.providers);

  const inputSpec = renderInput({
    name: 'input',
    label: Option.some('Beta'),
    inputMode: Option.none(),
    placeholder: Option.none(),
    maximized: false,
    disabled: false
  }, sharedBackstage.providers);

  const textareaSpec = renderTextarea({
    name: 'textarea',
    label: Option.some('Gamma'),
    placeholder: Option.none(),
    maximized: false,
    disabled: false
  }, sharedBackstage.providers);

  const labelSpec = renderLabel({
    label: 'A label wraps components in a group',
    items: [
      renderCheckbox({
        label: 'check box item 1',
        name: 'one',
        disabled: false
      }, sharedBackstage.providers) as any,
      renderCheckbox({
        label: 'check box item 2',
        name: 'two',
        disabled: false
      }, sharedBackstage.providers) as any,
      renderInput({
        label: Option.some('Sample input'),
        inputMode: Option.none(),
        placeholder: Option.none(),
        name: 'exampleinputfieldname',
        maximized: false,
        disabled: false
      }, sharedBackstage.providers) as any
    ]
  }, sharedBackstage);

  const labelGridSpec = renderLabel({
    label: 'A label wraps a grid compontent',
    items: [
      renderGrid({
        columns: 2,
        items: [
          renderButton({
            name: 'gridspecbutton',
            text: 'Click Me!',
            primary: false,
            disabled: false,
            icon: Option.none(),
            borderless: false
          }, () => {
            console.log('clicked on the button in the grid wrapped by a label');
          }, sharedBackstage.providers) as any,
          renderCheckbox({
            label: 'check box item 1',
            name: 'one',
            disabled: false
          }, sharedBackstage.providers) as any,
          renderCheckbox({
            label: 'check box item 2',
            name: 'two',
            disabled: false
          }, sharedBackstage.providers) as any,
          renderInput({
            label: Option.some('Sample input'),
            inputMode: Option.none(),
            placeholder: Option.none(),
            name: 'exampleinputfieldname',
            maximized: false,
            disabled: false
          }, sharedBackstage.providers) as any
        ]
      }, sharedBackstage) as any
    ]
  }, sharedBackstage);

  const gridSpec = renderGrid({
    columns: 5,
    items: [
      AlloyInput.sketch({ inputAttributes: { placeholder: 'Text goes here...' }}) as any,
      renderButton({
        name: 'gridspecbutton',
        text: 'Click Me!',
        primary: false,
        disabled: false,
        icon: Option.none(),
        borderless: false
      }, () => {
        console.log('clicked on the button in the grid');
      }, sharedBackstage.providers) as any
    ]
  }, sharedBackstage);

  const buttonSpec = renderButton({
    name: 'button1',
    text: 'Text',
    primary: false,
    disabled: false,
    icon: Option.none(),
    borderless: false
  }, () => {
    console.log('clicked on the button');
  }, sharedBackstage.providers);

  const checkboxSpec = (() => {
    const memBodyPanel = Memento.record(
      renderBodyPanel({
        items: [
          { type: 'checkbox', name: 'checked', label: 'Checked', disabled: false },
          { type: 'checkbox', name: 'unchecked', label: 'Unchecked', disabled: false }
        ],
        classes: []
      }, {
        shared: sharedBackstage
      })
    );

    return {
      dom: {
        tag: 'div'
      },
      components: [
        memBodyPanel.asSpec()
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

  const colorInputSpec = renderColorInput({
    name: 'colorinput-demo',
    label: Option.some('Color input label')
  }, sharedBackstage, backstage.colorinput);

  const colorPickerSpec = renderColorPicker({
    name: 'colorpicker-demo',
    label: Option.some('Color picker label')
  });

  const dropzoneSpec = renderDropZone({
    name: 'dropzone-demo',
    label: Option.some('Dropzone label')
  }, sharedBackstage.providers);

  const selectBoxSpec = renderSelectBox({
    name: 'selectbox-demo',
    size: 1,
    label: Option.some('Select one from'),
    disabled: false,
    items: [
      { value: 'one', text: 'One' },
      { value: 'two', text: 'Two' }
    ]
  }, sharedBackstage.providers);

  const selectBoxSizeSpec = renderSelectBox({
    name: 'selectbox-demo',
    size: 6,
    label: Option.some('Select one from'),
    disabled: false,
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
    name: 'sizeinput-demo',
    label: Option.some('kustom fixed ratio'),
    disabled: false
  }, sharedBackstage.providers);

  const urlInputSpec = renderUrlInput({
    name: 'blah',
    label: Option.some('Url'),
    filetype: 'image', // 'image' || 'media'
    disabled: false
  }, backstage, backstage.urlinput);

  const myScriptDataUri = `data:text/javascript,tinymce.Resource.add('myscript', function(el) {
    return new Promise(function (resolve) {
      var oldEl = el;
      var newEl = el.ownerDocument.createElement('span');
      newEl.innerText = 'this is a custom editor';
      el.parentElement.replaceChild(newEl, oldEl);

      var api = {
        getValue: () => newEl.innerText,
        setValue: (value) => {
          newEl.innerText = value;
        },
        destroy: () => { newEl.parentElement.replaceChild(oldEl, newEl); }        };

      resolve(api);
    });
  });`;

  const customEditorSpec = renderCustomEditor({
    type: 'customeditor',
    name: 'customeditor',
    tag: 'textarea',
    scriptId: 'myscript',
    scriptUrl: myScriptDataUri,
    settings: undefined
  });

  const alertBannerSpec = renderAlertBanner({
    text: 'The alert banner message',
    level: 'warn',
    icon: 'close',
    iconTooltip: 'Click here For somthing',
    url: ''
  }, sharedBackstage.providers);

  const display = (label: string, spec: SimpleSpec) => ({
    dom: {
      tag: 'div',
      styles: { border: '1px solid #aaa', margin: '1em', padding: '1em' }
    },
    components: [
      { dom: DomFactory.fromHtml('<h3>' + label + '</h3>') },
      { dom: { tag: 'hr' }},
      spec
    ]
  });

  const memCollection = Memento.record(
    renderCollection({
      columns: 1,
      name: 'collection',
      label: Option.some('Collection: ')
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
      display('SizeInput', sizeInputSpec),
      display('SelectBox', selectBoxSpec),
      display('SelectBox with Size', selectBoxSizeSpec),
      display('Grid', gridSpec),
      display('ColorPicker', colorPickerSpec),
      display('ColorInput', colorInputSpec),
      display('Checkbox', checkboxSpec),
      display('Button', buttonSpec),
      display('Label', labelSpec),
      display('Grid Label', labelGridSpec),
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
          text: 'A',
          icon: 'a'
        },
        {
          value: 'b',
          text: 'B',
          icon: 'b'
        },
        {
          value: 'c',
          text: 'C',
          icon: 'c'
        },
        {
          value: 'd',
          text: 'D',
          icon: 'd'
        }
      ])
    );
  });
};
