import { AlloyComponent, Behaviour, Button as AlloyButton, GuiFactory, Memento, Replacing, SimpleOrSketchSpec } from '@ephox/alloy';
import { View } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { Attribute, Class } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderReplaceableIconFromPack } from '../button/ButtonSlices';
import { calculateClassesFromButtonType, IconButtonWrapper, renderCommonSpec } from '../general/Button';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';

type Behaviours = Behaviour.NamedConfiguredBehaviour<any, any, any>[];

export const renderTogglableButton = (spec: View.ViewTogglableButton, providers: UiFactoryBackstageProviders): SimpleOrSketchSpec => {
  const optMemIcon = spec.icon
    .map((memIcon) => renderReplaceableIconFromPack(memIcon, providers.icons))
    .map(Memento.record);

  const action = (comp: AlloyComponent) => {
    spec.onAction({
      setIcon: (newIcon) => {
        optMemIcon.map((memIcon) => memIcon.getOpt(comp).each((displayIcon) => {
          Replacing.set(displayIcon, [
            renderReplaceableIconFromPack(newIcon, providers.icons)
          ]);
        }));
      },
      setActive: (state) => {
        const elm = comp.element;
        if (state) {
          Class.add(elm, ToolbarButtonClasses.Ticked);
          Attribute.set(elm, 'aria-pressed', true);
        } else {
          Class.remove(elm, ToolbarButtonClasses.Ticked);
          Attribute.remove(elm, 'aria-pressed');
        }
      },
      isActive: () => Class.has(comp.element, ToolbarButtonClasses.Ticked),
    });
  };

  const buttonSpec: IconButtonWrapper = {
    ...spec,
    name: spec.text.getOr(spec.icon.getOr('')),
    primary: spec.buttonType === 'primary',
    buttonType: Optional.from(spec.buttonType),
    tooltip: spec.tooltip,
    icon: spec.icon,
    enabled: true,
    borderless: spec.borderless
  };

  const tooltipAttributes = buttonSpec.tooltip.map<{}>((tooltip) => ({
    'aria-label': providers.translate(tooltip),
    'title': providers.translate(tooltip)
  })).getOr({});

  const buttonTypeClasses = calculateClassesFromButtonType(spec.buttonType ?? 'secondary');
  const optTranslatedText = spec.text.map(providers.translate);
  const optTranslatedTextComponed = optTranslatedText.map(GuiFactory.text);

  const optIconSpec = optMemIcon.map((memIcon) => memIcon.asSpec());
  const components = componentRenderPipeline([ optIconSpec, optTranslatedTextComponed ]);

  const hasIconAndText = optTranslatedTextComponed.isSome();

  const dom = {
    tag: 'button',
    classes: buttonTypeClasses
      .concat([ hasIconAndText ? 'tox-button--icon-and-text' : 'tox-button--icon' ])
      .concat(...spec.borderless ? [ 'tox-button--naked' ] : []),
    attributes: tooltipAttributes
  };
  const extraBehaviours: Behaviours = [];

  const iconButtonSpec = renderCommonSpec(buttonSpec, Optional.some(action), extraBehaviours, dom, components, providers);
  return AlloyButton.sketch(iconButtonSpec);
};
