/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, Button as AlloyButton, FormField as AlloyFormField, Memento,
  SimpleOrSketchSpec, SketchSpec, Tabstopping
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Merger, Optional } from '@ephox/katamari';

import { formActionEvent, formCancelEvent, formSubmitEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstage, UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { renderFormField } from '../alien/FieldLabeller';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { renderIconFromPack } from '../button/ButtonSlices';
import { getFetch, renderMenuButton, StoragedMenuButton } from '../button/MenuButton';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';

type ButtonSpec = Omit<Dialog.Button, 'type'>;
type FooterButtonSpec = Omit<Dialog.DialogFooterNormalButton, 'type'> | Omit<Dialog.DialogFooterMenuButton, 'type'>;

export interface IconButtonWrapper extends Omit<ButtonSpec, 'text'> {
  tooltip: Optional<string>;
}

const renderCommonSpec = (spec, actionOpt: Optional<(comp: AlloyComponent) => void>, extraBehaviours = [], dom, components, providersBackstage: UiFactoryBackstageProviders) => {
  const action = actionOpt.fold(() => ({}), (action) => ({
    action
  }));

  const common = {
    buttonBehaviours: Behaviour.derive([
      DisablingConfigs.button(() => spec.disabled || providersBackstage.isDisabled()),
      ReadOnly.receivingConfig(),
      Tabstopping.config({}),
      AddEventsBehaviour.config('button press', [
        AlloyEvents.preventDefault('click'),
        AlloyEvents.preventDefault('mousedown')
      ])
    ].concat(extraBehaviours)),
    eventOrder: {
      click: [ 'button press', 'alloy.base.behaviour' ],
      mousedown: [ 'button press', 'alloy.base.behaviour' ]
    },
    ...action
  };
  const domFinal = Merger.deepMerge(common, { dom });
  return Merger.deepMerge(domFinal, { components });
};

export const renderIconButtonSpec = (spec: IconButtonWrapper, action: Optional<(comp: AlloyComponent) => void>, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = []) => {
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
  return renderCommonSpec(spec, action, extraBehaviours, dom, components, providersBackstage);
};

export const renderIconButton = (spec: IconButtonWrapper, action: (comp: AlloyComponent) => void, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = []): SketchSpec => {
  const iconButtonSpec = renderIconButtonSpec(spec, Optional.some(action), providersBackstage, extraBehaviours);
  return AlloyButton.sketch(iconButtonSpec);
};

// Maybe the list of extraBehaviours is better than doing a Merger.deepMerge that
// we do elsewhere? Not sure.
export const renderButtonSpec = (spec: ButtonSpec, action: Optional<(comp: AlloyComponent) => void>, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = [], extraClasses = []) => {
  const translatedText = providersBackstage.translate(spec.text);

  const icon: Optional<AlloySpec> = spec.icon ? spec.icon.map((iconName) => renderIconFromPack(iconName, providersBackstage.icons)) : Optional.none();
  const components = icon.isSome() ? componentRenderPipeline([ icon ]) : [];

  const innerHtml = icon.isSome() ? {} : {
    innerHtml: translatedText
  };

  const classes = [
    ...!spec.primary && !spec.borderless ? [ 'tox-button', 'tox-button--secondary' ] : [ 'tox-button' ],
    ...icon.isSome() ? [ 'tox-button--icon' ] : [],
    ...spec.borderless ? [ 'tox-button--naked' ] : [],
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
  return renderCommonSpec(spec, action, extraBehaviours, dom, components, providersBackstage);
};

export const renderButton = (spec: ButtonSpec, action: (comp: AlloyComponent) => void, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = [], extraClasses = []): SketchSpec => {
  const buttonSpec = renderButtonSpec(spec, Optional.some(action), providersBackstage, extraBehaviours, extraClasses);
  return AlloyButton.sketch(buttonSpec);
};

const getAction = (name: string, buttonType: string) => (comp: AlloyComponent) => {
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
    // eslint-disable-next-line no-console
    console.error('Unknown button type: ', buttonType);
  }
};

const isMenuFooterButtonSpec = (spec: FooterButtonSpec, buttonType: string): spec is Dialog.DialogFooterMenuButton => buttonType === 'menu';

const isNormalFooterButtonSpec = (spec: FooterButtonSpec, buttonType: string): spec is Dialog.DialogFooterNormalButton => buttonType === 'custom' || buttonType === 'cancel' || buttonType === 'submit';

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

    const memButton = Memento.record(renderMenuButton(fixedSpec, ToolbarButtonClasses.Button, backstage, Optional.none()));

    return memButton.asSpec();
  } else if (isNormalFooterButtonSpec(spec, buttonType)) {
    const action = getAction(spec.name, buttonType);
    const buttonSpec = {
      ...spec,
      borderless: false
    };
    return renderButton(buttonSpec, action, backstage.shared.providers, [ ]);
  } else {
    // eslint-disable-next-line no-console
    console.error('Unknown footer button type: ', buttonType);
  }
};

export const renderDialogButton = (spec: ButtonSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const action = getAction(spec.name, 'custom');
  return renderFormField(Optional.none(), AlloyFormField.parts.field({
    factory: AlloyButton,
    ...renderButtonSpec(spec, Optional.some(action), providersBackstage, [
      RepresentingConfigs.memory(''),
      ComposingConfigs.self()
    ])
  }));
};
