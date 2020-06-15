/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { ColourPicker } from '@ephox/acid';
import { AlloyTriggers, Behaviour, Composing, Form, Memento, NativeEvents, Representing, SimpleSpec } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { console } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { formActionEvent } from '../general/FormEvents';
import { Omit } from '../Omit';

// import I18n from 'tinymce/core/api/util/I18n';

const english = {
  'colorcustom.rgb.red.label': 'R',
  'colorcustom.rgb.red.description': 'Red component',
  'colorcustom.rgb.green.label': 'G',
  'colorcustom.rgb.green.description': 'Green component',
  'colorcustom.rgb.blue.label': 'B',
  'colorcustom.rgb.blue.description': 'Blue component',
  'colorcustom.rgb.hex.label': '#',
  'colorcustom.rgb.hex.description': 'Hex color code',
  'colorcustom.rgb.range': 'Range 0 to 255',
  'colorcustom.sb.saturation': 'Saturation',
  'colorcustom.sb.brightness': 'Brightness',
  'colorcustom.sb.picker': 'Saturation and Brightness Picker',
  'colorcustom.sb.palette': 'Saturation and Brightness Palette',
  'colorcustom.sb.instructions': 'Use arrow keys to select saturation and brightness, on x and y axes',
  'colorcustom.hue.hue': 'Hue',
  'colorcustom.hue.slider': 'Hue Slider',
  'colorcustom.hue.palette': 'Hue Palette',
  'colorcustom.hue.instructions': 'Use arrow keys to select a hue',
  'aria.color.picker': 'Color Picker',
  'aria.input.invalid': 'Invalid input'
};

const getEnglishText = function (key) {
  return english[key];
};

const translate = function (key) {
  // TODO: use this: I18n.translate()
  return getEnglishText(key);
};

type ColorPickerSpec = Omit<Types.ColorPicker.ColorPicker, 'type'>;

export const renderColorPicker = (_spec: ColorPickerSpec): SimpleSpec => {
  const getClass = (key: string) => 'tox-' + key;

  const colourPickerFactory = ColourPicker.makeFactory(translate, getClass);

  const onValidHex = (form) => {
    AlloyTriggers.emitWith(form, formActionEvent, { name: 'hex-valid', value: true }, );
  };

  const onInvalidHex = (form) => {
    AlloyTriggers.emitWith(form, formActionEvent, { name: 'hex-valid', value: false } );
  };

  const memPicker = Memento.record(
    colourPickerFactory.sketch({
      dom: {
        tag: 'div',
        classes: [ getClass('color-picker-container') ],
        attributes: {
          role: 'presentation'
        }
      },
      onValidHex,
      onInvalidHex
    })
  );

  return {
    dom: {
      tag: 'div'
    },
    components: [
      memPicker.asSpec()
    ],
    behaviours: Behaviour.derive([
      // We'll allow invalid values
      Representing.config({
        store: {
          mode: 'manual',
          getValue: (comp) => {
            const picker = memPicker.get(comp);
            const optRgbForm = Composing.getCurrent(picker);
            const optHex = optRgbForm.bind((rgbForm) => {
              const formValues = Representing.getValue(rgbForm);
              return formValues.hex as Option<string>;
            }) ;
            return optHex.map((hex) => '#' + hex).getOr('');
          },
          setValue: (comp, newValue) => {
            const pattern = /^#([a-fA-F0-9]{3}(?:[a-fA-F0-9]{3})?)/;
            const m = pattern.exec(newValue);
            const picker = memPicker.get(comp);
            const optRgbForm = Composing.getCurrent(picker);
            optRgbForm.fold(() => {
              // tslint:disable-next-line:no-console
              console.log('Can not find form');
            }, (rgbForm) => {
              Representing.setValue(rgbForm, {
                hex: Option.from(m[1]).getOr('')
              });

              // So not the way to do this.
              Form.getField(rgbForm, 'hex').each((hexField) => {
                AlloyTriggers.emit(hexField, NativeEvents.input());
              });
            });
          }
        }
      }),
      ComposingConfigs.self()
    ])
  };
};