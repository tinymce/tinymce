import { AlloyComponent, Behaviour, Button as AlloyButton, GuiFactory, Memento, Replacing, SimpleOrSketchSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { Attribute, Class } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderReplaceableIconFromPack } from '../button/ButtonSlices';
import { calculateClassesFromButtonType, IconButtonWrapper, renderCommonSpec } from '../general/Button';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import { ViewButtonClasses } from '../toolbar/button/ButtonClasses';
import { ViewButtonWithoutGroup } from './View';

type Behaviours = Behaviour.NamedConfiguredBehaviour<any, any, any>[];

export const renderButton = (spec: ViewButtonWithoutGroup, providers: UiFactoryBackstageProviders): SimpleOrSketchSpec => {
  const isToggleButton = spec.type === 'togglebutton';

  const optMemIcon = spec.icon
    .map((memIcon) => renderReplaceableIconFromPack(memIcon, providers.icons))
    .map(Memento.record);

  const getAction = () => (comp: AlloyComponent) => {
    const setIcon = (newIcon: string) => {
      optMemIcon.map((memIcon) => memIcon.getOpt(comp).each((displayIcon) => {
        Replacing.set(displayIcon, [
          renderReplaceableIconFromPack(newIcon, providers.icons)
        ]);
      }));
    };
    const setActive = (state: boolean) => {
      const elm = comp.element;
      if (state) {
        Class.add(elm, ViewButtonClasses.Ticked);
        Attribute.set(elm, 'aria-pressed', true);
      } else {
        Class.remove(elm, ViewButtonClasses.Ticked);
        Attribute.remove(elm, 'aria-pressed');
      }
    };
    const isActive = () => Class.has(comp.element, ViewButtonClasses.Ticked);

    if (isToggleButton) {
      return spec.onAction({ setIcon, setActive, isActive });
    }
    if (spec.type === 'button') {
      return spec.onAction({ setIcon });
    }
  };

  const action = getAction();

  const buttonSpec: IconButtonWrapper = {
    ...spec,
    name: isToggleButton ? spec.text.getOr(spec.icon.getOr('')) : spec.text ?? spec.icon.getOr(''),
    primary: spec.buttonType === 'primary',
    buttonType: Optional.from(spec.buttonType),
    tooltip: spec.tooltip,
    icon: spec.icon,
    enabled: true,
    borderless: spec.borderless
  };

  const buttonTypeClasses = calculateClassesFromButtonType(spec.buttonType ?? 'secondary');
  const optTranslatedText = isToggleButton ? spec.text.map(providers.translate) : Optional.some(providers.translate(spec.text));
  const optTranslatedTextComponed = optTranslatedText.map(GuiFactory.text);

  const tooltipAttributes = buttonSpec.tooltip.or(optTranslatedText).map<{}>((tooltip) => ({
    'aria-label': providers.translate(tooltip),
    'title': providers.translate(tooltip)
  })).getOr({});

  const optIconSpec = optMemIcon.map((memIcon) => memIcon.asSpec());
  const components = componentRenderPipeline([ optIconSpec, optTranslatedTextComponed ]);

  const hasIconAndText = spec.icon.isSome() && optTranslatedTextComponed.isSome();

  const dom = {
    tag: 'button',
    classes: buttonTypeClasses
      .concat(...spec.icon.isSome() && !hasIconAndText ? [ 'tox-button--icon' ] : [])
      .concat(...hasIconAndText ? [ 'tox-button--icon-and-text' ] : [])
      .concat(...spec.borderless ? [ 'tox-button--naked' ] : [])
      .concat(...spec.type === 'togglebutton' && spec.active ? [ ViewButtonClasses.Ticked ] : []),
    attributes: tooltipAttributes
  };
  const extraBehaviours: Behaviours = [];

  const iconButtonSpec = renderCommonSpec(buttonSpec, Optional.some(action), extraBehaviours, dom, components, providers);
  return AlloyButton.sketch(iconButtonSpec);
};
