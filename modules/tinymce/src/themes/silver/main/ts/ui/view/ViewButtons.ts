import { AlloyComponent, Behaviour, Button as AlloyButton, Disabling, Memento, Replacing, SimpleOrSketchSpec } from '@ephox/alloy';
import { View } from '@ephox/bridge';
import { Cell, Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderReplaceableIconFromPack } from '../button/ButtonSlices';
import { calculateClassesFromButtonType, IconButtonWrapper, renderCommonSpec } from '../general/Button';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';

type Behaviours = Behaviour.NamedConfiguredBehaviour<any, any, any>[];

export const renderTogglableIconButton = (spec: View.ViewTogglableIconButtonSpec, providers: UiFactoryBackstageProviders): SimpleOrSketchSpec => {
  const optMemIcon = Optional.some((spec.initialStatus === 'normal' ? spec.icon : spec.toggledIcon))
    .map((iconName) => renderReplaceableIconFromPack(iconName, providers.icons))
    .map(Memento.record);
  const currentStatus = Cell(spec.initialStatus);

  const action = (comp: AlloyComponent) => {
    spec.onAction({
      getStatus: () => currentStatus.get(),
      setStatus: (newStatus) => {
        optMemIcon.bind((mem) => mem.getOpt(comp)).each((displayIcon) => {
          if (newStatus === 'normal') {
            Replacing.set(displayIcon, [
              renderReplaceableIconFromPack(spec.icon ?? '', providers.icons)
            ]);
          } else {
            Replacing.set(displayIcon, [
              renderReplaceableIconFromPack(spec.toggledIcon ?? '', providers.icons)
            ]);
          }
          currentStatus.set(newStatus);
        });
      },
      isEnabled: () => !Disabling.isDisabled(comp),
      setEnabled: (state: boolean) => Disabling.set(comp, !state)
    });
  };

  const buttonSpec: IconButtonWrapper = {
    ...spec,
    primary: spec.buttonType === 'primary',
    buttonType: Optional.from(spec.buttonType),
    tooltip: Optional.from(spec.text),
    icon: Optional.from(spec.name),
    enabled: spec.enabled ?? false,
    borderless: false
  };

  const tooltipAttributes = buttonSpec.tooltip.map<{}>((tooltip) => ({
    'aria-label': providers.translate(tooltip),
    'title': providers.translate(tooltip)
  })).getOr({});

  const buttonTypeClasses = calculateClassesFromButtonType(spec.buttonType ?? 'secondary');
  const dom = {
    tag: 'button',
    classes: buttonTypeClasses.concat([ 'tox-button--icon' ]),
    attributes: tooltipAttributes
  };
  const extraBehaviours: Behaviours = [];
  const components = optMemIcon.map((memIcon) => componentRenderPipeline([ Optional.some(memIcon.asSpec()) ])).getOr([]);
  const iconButtonSpec = renderCommonSpec(buttonSpec, Optional.some(action), extraBehaviours, dom, components, providers);
  return AlloyButton.sketch(iconButtonSpec);
};
