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
  AlloyComponent,
  Disabling,
} from '@ephox/alloy';
import { console } from '@ephox/dom-globals';
import { Merger, Option } from '@ephox/katamari';
import { formActionEvent, formCancelEvent, formSubmitEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstageProviders, UiFactoryBackstage } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { renderIconFromPack } from '../button/ButtonSlices';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';
import { Types, Toolbar } from '@ephox/bridge';
import { Omit } from '../Omit';
import { renderCommonDropdown } from '../dropdown/CommonDropdown';
import * as NestedMenus from '../menus/menu/NestedMenus';
import { Class, Attr } from '@ephox/sugar';
import ItemResponse from '../menus/item/ItemResponse';

type ButtonSpec = Omit<Types.Button.Button, 'type'>;
type SuccessCallback = (menu: string | any) => void;
interface FooterButtonSpec extends Omit<Types.DialogButton, 'type'> {
  tooltip?: Option<string>;
  fetch?: (success: SuccessCallback) => void;
  onSetup?: (api: any) => (api: any) => void;
}

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
export const renderButton = (spec: ButtonSpec, action, providersBackstage: UiFactoryBackstageProviders, extraBehaviours = [], extraClasses = []): SketchSpec => {
  const translatedText = providersBackstage.translate(spec.text);

  const icon = spec.icon ? spec.icon.map((iconName) => renderIconFromPack(iconName, providersBackstage.icons)) : Option.none();
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
      // tslint:disable-next-line:no-console
      console.error('Unknown button type: ', buttonType);
    }
  };
};

export const renderFooterButton = (spec: FooterButtonSpec, buttonType: string, backstage: UiFactoryBackstage): SketchSpec => {
  const action = getAction(spec.name, buttonType);
  const buttonSpec = {
    ...spec,
    borderless: false
  };
  return buttonType === 'menu' ? renderMenuButton(spec, ToolbarButtonClasses.Button, backstage, Option.none()) : renderButton(buttonSpec, action, backstage.shared.providers, [ ]);
};

export const renderDialogButton = (spec: ButtonSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const action = getAction(spec.name, 'custom');
  return renderButton(spec, action, providersBackstage, [
    RepresentingConfigs.memory(''),
    ComposingConfigs.self()
  ]);
};

const getMenuButtonApi = (component: AlloyComponent): Toolbar.ToolbarMenuButtonInstanceApi => {
  return {
    isDisabled: () => Disabling.isDisabled(component),
    setDisabled: (state: boolean) => Disabling.set(component, state),
    setActive: (state: boolean) => {
      // Note: We can't use the toggling behaviour here, as the dropdown for the menu also relies on it.
      // As such, we'll need to do this manually
      const elm = component.element();
      if (state) {
        Class.add(elm, ToolbarButtonClasses.Ticked);
        Attr.set(elm, 'aria-pressed', true);
      } else {
        Class.remove(elm, ToolbarButtonClasses.Ticked);
        Attr.remove(elm, 'aria-pressed');
      }
    },
    isActive: () => Class.has(component.element(), ToolbarButtonClasses.Ticked)
  };
};

const renderMenuButton = (spec: FooterButtonSpec, prefix: string, backstage: UiFactoryBackstage, role: Option<string>): SketchSpec => {
  return renderCommonDropdown({
      text: Option.from(spec.text),
      icon: spec.icon,
      tooltip: spec.tooltip,
      // https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-2/menubar-2.html
      role,
      fetch: (callback) => {
        spec.fetch((items) => {
          callback(
            NestedMenus.build(items, ItemResponse.CLOSE_ON_EXECUTE, backstage)
          );
        });
      },
      onSetup: spec.onSetup,
      getApi: getMenuButtonApi,
      columns: 1,
      presets: 'normal',
      classes: [],
      dropdownBehaviours: []
    },
    prefix,
    backstage.shared);
};
