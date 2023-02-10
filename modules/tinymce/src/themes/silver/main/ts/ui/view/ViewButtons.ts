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

export const renderTogglableIconButton = (spec: View.ViewTogglableIconButton, providers: UiFactoryBackstageProviders): SimpleOrSketchSpec => {
  const optMemIcon = spec.icon
    .map((iconName) => renderReplaceableIconFromPack(iconName, providers.icons))
    .map(Memento.record);

  const action = (comp: AlloyComponent) => {
    spec.onAction({
      setIcon: (newIcon) => {
        optMemIcon.bind((mem) => mem.getOpt(comp)).each((displayIcon) => {
          Replacing.set(displayIcon, [
            renderReplaceableIconFromPack(newIcon, providers.icons)
          ]);
        });
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
    primary: spec.buttonType === 'primary',
    buttonType: Optional.from(spec.buttonType),
    tooltip: spec.text,
    icon: Optional.from(spec.name),
    enabled: true,
    borderless: false
  };

  const tooltipAttributes = buttonSpec.tooltip.map<{}>((tooltip) => ({
    'aria-label': providers.translate(tooltip),
    'title': providers.translate(tooltip)
  })).getOr({});

  const buttonTypeClasses = calculateClassesFromButtonType(spec.buttonType ?? 'secondary');
  const optTranslatedText = spec.text.map(providers.translate);
  const optTranslatedTextComponed = optTranslatedText.map(GuiFactory.text);

  const optIcon = optMemIcon.map((memIcon) => memIcon.asSpec());
  const components = componentRenderPipeline([ optIcon, optTranslatedTextComponed ]);

  const hasIconAndText = optTranslatedTextComponed.isSome() && optIcon.isSome();

  const dom = {
    tag: 'button',
    classes: buttonTypeClasses.concat([ hasIconAndText ? 'tox-button--icon-and-text' : 'tox-button--icon' ]),
    attributes: tooltipAttributes
  };
  const extraBehaviours: Behaviours = [];

  const iconButtonSpec = renderCommonSpec(buttonSpec, Optional.some(action), extraBehaviours, dom, components, providers);
  return AlloyButton.sketch(iconButtonSpec);
};
