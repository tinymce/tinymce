import { ColourPicker } from '@ephox/acid';
import { AlloyComponent, AlloyTriggers, Behaviour, Composing, Form, Memento, NativeEvents, Representing, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional, Strings, Type } from '@ephox/katamari';

import { Untranslated } from 'tinymce/core/api/util/I18n';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import { formActionEvent } from '../general/FormEvents';
import * as Icons from '../icons/Icons';

const english: Record<string, string> = {
  'colorcustom.rgb.red.label': 'R',
  'colorcustom.rgb.red.description': 'Red channel',
  'colorcustom.rgb.green.label': 'G',
  'colorcustom.rgb.green.description': 'Green channel',
  'colorcustom.rgb.blue.label': 'B',
  'colorcustom.rgb.blue.description': 'Blue channel',
  'colorcustom.rgb.hex.label': '#',
  'colorcustom.rgb.hex.description': 'Hex color code',
  'colorcustom.rgb.range': 'Range 0 to 255',
  'colorcustom.rgb.invalid': 'Numbers only, 0 to 255',
  'colorcustom.rgb.invalidHex': 'Hexadecimal only, 000000 to FFFFFF',
  'aria.color.picker': 'Color Picker',
  'aria.input.invalid': 'Invalid input'
};

const translate = (providerBackstage: UiFactoryBackstageProviders) => (key: Untranslated) => {
  if (Type.isString(key)) {
    return providerBackstage.translate(english[key]);
  } else {
    return providerBackstage.translate(key);
  }
};

type ColorPickerSpec = Omit<Dialog.ColorPicker, 'type'>;

export const renderColorPicker = (_spec: ColorPickerSpec, providerBackstage: UiFactoryBackstageProviders, initialData: Optional<string>): SimpleSpec => {
  const getClass = (key: string) => 'tox-' + key;
  const renderIcon = (name: string, errId: Optional<string>, icon: string = name, label: string = name): SimpleSpec =>
    Icons.render(icon, {
      tag: 'div',
      classes: [ 'tox-icon', 'tox-control-wrap__status-icon-' + name ],
      attributes: {
        'title': providerBackstage.translate(label),
        'aria-live': 'polite',
        ...errId.fold(() => ({}), (id) => ({ id }))
      }
    }, providerBackstage.icons);

  const colourPickerFactory = ColourPicker.makeFactory(translate(providerBackstage), getClass, providerBackstage.tooltips.getConfig, renderIcon);

  const onValidHex = (form: AlloyComponent) => {
    AlloyTriggers.emitWith(form, formActionEvent, { name: 'hex-valid', value: true });
  };

  const onInvalidHex = (form: AlloyComponent) => {
    AlloyTriggers.emitWith(form, formActionEvent, { name: 'hex-valid', value: false });
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
      RepresentingConfigs.withComp(
        initialData,
        (comp) => {
          const picker = memPicker.get(comp);
          const optRgbForm = Composing.getCurrent(picker);
          const optHex = optRgbForm.bind((rgbForm) => {
            const formValues = Representing.getValue(rgbForm);
            return formValues.hex as Optional<string>;
          });
          return optHex.map((hex) => '#' + Strings.removeLeading(hex, '#')).getOr('');
        },
        (comp, newValue) => {
          const pattern = /^#([a-fA-F0-9]{3}(?:[a-fA-F0-9]{3})?)/;
          const valOpt = Optional.from(pattern.exec(newValue)).bind((matches) => Arr.get(matches, 1));
          const picker = memPicker.get(comp);
          const optRgbForm = Composing.getCurrent(picker);
          optRgbForm.fold(() => {
            // eslint-disable-next-line no-console
            console.log('Can not find form');
          }, (rgbForm) => {
            Representing.setValue(rgbForm, {
              hex: valOpt.getOr('')
            });

            // So not the way to do this.
            Form.getField(rgbForm, 'hex').each((hexField) => {
              AlloyTriggers.emit(hexField, NativeEvents.input());
            });
          });
        }
      ),
      ComposingConfigs.self()
    ])
  };
};
