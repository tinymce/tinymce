import { AlloyTriggers, Behaviour, Button, Container, SketchSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';

import { formActionEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';

type AlertBannerSpec = Omit<Dialog.AlertBanner, 'type'>;

export interface AlertBannerWrapper extends AlertBannerSpec {
  readonly iconTooltip?: string;
}

export const renderAlertBanner = (spec: AlertBannerWrapper, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  const icon = Icons.get(spec.icon, providersBackstage.icons);

  // For using the alert banner inside a dialog
  return Container.sketch({
    dom: {
      tag: 'div',
      attributes: {
        role: 'alert'
      },
      classes: [ 'tox-notification', 'tox-notification--in', `tox-notification--${spec.level}` ]
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-notification__icon' ],
          innerHtml: !spec.url ? icon : undefined
        },
        components: spec.url ? [
          Button.sketch({
            dom: {
              tag: 'button',
              classes: [ 'tox-button', 'tox-button--naked', 'tox-button--icon' ],
              innerHtml: icon,
              attributes: {
                title: providersBackstage.translate(spec.iconTooltip)
              }
            },
            // TODO: aria label this button!
            action: (comp) => AlloyTriggers.emitWith(comp, formActionEvent, { name: 'alert-banner', value: spec.url }),
            buttonBehaviours: Behaviour.derive([
              Icons.addFocusableBehaviour()
            ])
          })
        ] : undefined
      },
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-notification__body' ],
          // TODO: AP-247: Escape this text so that it can't contain script tags
          innerHtml: providersBackstage.translate(spec.text)
        }
      }
    ]
  });
};
