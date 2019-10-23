/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyComponent,
  AlloyEvents,
  AlloySpec,
  AlloyTriggers,
  Behaviour,
  Button as AlloyButton,
  FormField as AlloyFormField,
  SketchSpec,
  Tabstopping,
  Memento,
  SimpleOrSketchSpec
} from '@ephox/alloy';
import { console } from '@ephox/dom-globals';
import { Fun, Merger, Option } from '@ephox/katamari';
import { formActionEvent, formCancelEvent, formSubmitEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstageProviders, UiFactoryBackstage } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { renderIconFromPack } from '../button/ButtonSlices';
import { renderMenuButton, getFetch, StoragedMenuButton } from '../button/MenuButton';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';
import { Types } from '@ephox/bridge';
import { Omit } from '../Omit';
import { renderFormField } from '../alien/FieldLabeller';

type ButtonSpec = Omit<Types.Button.Button, 'type'>;
type FooterButtonSpec = Omit<Types.Dialog.DialogNormalButton, 'type'> | Omit<Types.Dialog.DialogMenuButton, 'type'>;

export interface IconButtonWrapper extends Omit<ButtonSpec, 'text'> {
  tooltip: Option<string>;
}

const renderCommonSpec = (spec, actionOpt: Option<(comp: AlloyComponent) => void>, extraBehaviours = [], dom, components) => {
  const action = actionOpt.fold(() => {
    return {};
  }, (action) => {
    return {
      action
    };
  });

  const common = {
    buttonBehaviours: Behaviour.derive([
      DisablingConfigs.button(spec.disabled),
      Tabstopping.config({}),
      AddEventsBehaviour.config('button press', [
        AlloyEvents.preventDefault('click'),
        AlloyEvents.preventDefault('mousedown')
      ])
    ].concat(extraBehaviours)),
    eventOrder: {
      click: ['button press', 'alloy.base.behaviour'],
      mousedown: ['button press', 'alloy.base.behaviour']
    },
    ...action
  };
  const domFinal = Merger.deepMerge(common, { dom });
  return Merger.deepMerge(domFinal, { components });
};

export const renderIconButtonSpec = (spec: IconButtonWrapper, action: Option<(comp: AlloyComponent) => void>, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = []) => {
  const tooltipAttributes = spec.tooltip.map<{}>((tooltip) => ({
    'aria-label': providersBackstage.translate(tooltip),
    'title': providersBackstage.translate(tooltip)
  })).getOr({});
  const dom = {
    tag: 'button',
    classes: [ ToolbarButtonClasses.Button ],
    attributes: tooltipAttributes
  };
  const icon = spec.icon.map((iconName) => renderIconFromPack(iconName, providersBackstage.icons));
  const components = componentRenderPipeline([
    icon
  ]);
  return renderCommonSpec(spec, action, extraBehaviours, dom, components);
};

export const renderIconButton = (spec: IconButtonWrapper, action: (comp: AlloyComponent) => void, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = []): SketchSpec => {
  const iconButtonSpec = renderIconButtonSpec(spec, Option.some(action), providersBackstage, extraBehaviours);
  return AlloyButton.sketch(iconButtonSpec);
};

// Maybe the list of extraBehaviours is better than doing a Merger.deepMerge that
// we do elsewhere? Not sure.
export const renderButtonSpec = (spec: ButtonSpec, action: Option<(comp: AlloyComponent) => void>, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = [], extraClasses = []) => {
  const translatedText = providersBackstage.translate(spec.text);

  const icon: Option<AlloySpec> = spec.icon ? spec.icon.map((iconName) => renderIconFromPack(iconName, providersBackstage.icons)) : Option.none();
  const components = icon.isSome() ? componentRenderPipeline([ icon ]) : [];

  const innerHtml = icon.isSome() ? {} : {
    innerHtml: translatedText
  };

  const classes = [
    ...!spec.primary && !spec.borderless ? ['tox-button', 'tox-button--secondary'] : ['tox-button'],
    ...icon.isSome() ? ['tox-button--icon'] : [],
    ...spec.borderless ? ['tox-button--naked'] : [],
    ...extraClasses
  ];

  const dom = {
    tag: 'button',
    classes,
    ...innerHtml,
    attributes: {
      title: translatedText // TODO: tooltips AP-213
    }
  };
  return renderCommonSpec(spec, action, extraBehaviours, dom, components);
};

export const renderButton = (spec: ButtonSpec, action: (comp: AlloyComponent) => void, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = [], extraClasses = []): SketchSpec => {
  const buttonSpec = renderButtonSpec(spec, Option.some(action), providersBackstage, extraBehaviours, extraClasses);
  return AlloyButton.sketch(buttonSpec);
};

const getAction = (name: string, buttonType: string) => {
  return (comp: AlloyComponent) => {
    if (buttonType === 'custom') {
      AlloyTriggers.emitWith(comp, formActionEvent, {
        name,
        value: { }
      });
    } else if (buttonType === 'submit') {
      AlloyTriggers.emit(comp, formSubmitEvent);
    } else if (buttonType === 'cancel') {
      AlloyTriggers.emit(comp, formCancelEvent);
    } else {
      // tslint:disable-next-line:no-console
      console.error('Unknown button type: ', buttonType);
    }
  };
};

const isMenuFooterButtonSpec = (spec: FooterButtonSpec, buttonType: string): spec is Types.Dialog.DialogMenuButton => {
  return buttonType === 'menu';
};

const isNormalFooterButtonSpec = (spec: FooterButtonSpec, buttonType: string): spec is Types.Dialog.DialogNormalButton => {
  return buttonType === 'custom' || buttonType === 'cancel' || buttonType === 'submit';
};

export const renderFooterButton = (spec: FooterButtonSpec, buttonType: string, backstage: UiFactoryBackstage): SimpleOrSketchSpec => {
  if (isMenuFooterButtonSpec(spec, buttonType)) {
    const getButton = () => memButton;

    const menuButtonSpec = spec as StoragedMenuButton;

    const fixedSpec = {
      ...spec,
      onSetup: (api) => {
        api.setDisabled(spec.disabled);
        return Fun.noop;
      },
      fetch: getFetch(menuButtonSpec.items, getButton, backstage)
    };

    const memButton = Memento.record(renderMenuButton(fixedSpec, ToolbarButtonClasses.Button, backstage, Option.none()));

    return memButton.asSpec();
  } else if (isNormalFooterButtonSpec(spec, buttonType)) {
    const action = getAction(spec.name, buttonType);
    const buttonSpec = {
      ...spec,
      borderless: false
    };
    return renderButton(buttonSpec, action, backstage.shared.providers, [ ]);
  } else {
    // tslint:disable-next-line:no-console
    console.error('Unknown footer button type: ', buttonType);
  }
};

export const renderDialogButton = (spec: ButtonSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const action = getAction(spec.name, 'custom');
  return renderFormField(Option.none(), AlloyFormField.parts().field({
    factory: AlloyButton,
    ...renderButtonSpec(spec, Option.some(action), providersBackstage, [
      RepresentingConfigs.memory(''),
      ComposingConfigs.self()
    ])
  }));
};
