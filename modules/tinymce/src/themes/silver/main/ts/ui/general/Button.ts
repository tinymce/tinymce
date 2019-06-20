/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloyTriggers,
  Behaviour,
  Button as AlloyButton,
  SketchSpec,
  Tabstopping,
} from '@ephox/alloy';
import { console } from '@ephox/dom-globals';
import { Merger, Option } from '@ephox/katamari';
import { formActionEvent, formCancelEvent, formSubmitEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { renderIconFromPack } from '../button/ButtonSlices';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';
import { Types } from '@ephox/bridge';
import { Omit } from '../Omit';

type ButtonSpec = Omit<Types.Button.Button, 'type'>;

type FooterButtonSpec = Omit<Types.DialogButton, 'type'>;
export interface IconButtonWrapper extends Omit<ButtonSpec, 'text'> {
  tooltip: Option<string>;
}

const renderCommonSpec = (spec, actionOpt, extraBehaviours = [], dom, components) => {
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

const renderCommon = (spec, action, extraBehaviours = [], dom, components): SketchSpec => {
  const specFinal = renderCommonSpec(spec, Option.some(action), extraBehaviours, dom, components);
  return AlloyButton.sketch(specFinal);
};

export const renderIconButtonSpec = (spec: IconButtonWrapper, action, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = []) => {
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

export const renderIconButton = (spec: IconButtonWrapper, action, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = []): SketchSpec => {
  const iconButtonSpec = renderIconButtonSpec(spec, Option.some(action), providersBackstage, extraBehaviours);
  return AlloyButton.sketch(iconButtonSpec);
};

// Maybe the list of extraBehaviours is better than doing a Merger.deepMerge that
// we do elsewhere? Not sure.
export const renderButton = (spec: ButtonSpec, action, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = []): SketchSpec => {
  const translatedText = providersBackstage.translate(spec.text);

  const icon = spec.icon ? spec.icon.map((iconName) => renderIconFromPack(iconName, providersBackstage.icons)) : Option.none();
  const components = icon.isSome() ? componentRenderPipeline([ icon ]) : [];

  const innerHtml = icon.isSome() ? {} : {
    innerHtml: translatedText
  };

  const classes = [
    ...spec.primary ? ['tox-button'] : ['tox-button', 'tox-button--secondary'],
    ...icon.isSome() ? ['tox-button--icon'] : []
  ];

  const dom = {
    tag: 'button',
    classes,
    ...innerHtml,
    attributes: {
      title: translatedText // TODO: tooltips AP-213
    }
  };
  return renderCommon(spec, action, extraBehaviours, dom, components);
};

const getAction = (name: string, buttonType) => {
  return (comp) => {
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
      console.error('Unknown button type: ', buttonType);
    }
  };
};

export const renderFooterButton = (spec: FooterButtonSpec, buttonType: string, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const action = getAction(spec.name, buttonType);
  return renderButton(spec, action, providersBackstage, [ ]);
};

export const renderDialogButton = (spec: ButtonSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const action = getAction(spec.name, 'custom');
  return renderButton(spec, action, providersBackstage, [
    RepresentingConfigs.memory(''),
    ComposingConfigs.self()
  ]);
};