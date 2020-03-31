/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { AlloyTriggers, Button, Container, SketchSpec } from '@ephox/alloy';
import { formActionEvent } from 'tinymce/themes/silver/ui/general/FormEvents';
import * as Icons from '../icons/Icons';
import { Types } from '@ephox/bridge';
import { Omit } from '../Omit';

type AlertBannerSpec = Omit<Types.AlertBanner.AlertBanner, 'type'>;

export interface AlertBannerWrapper extends AlertBannerSpec {
  iconTooltip: string;
}

export const renderAlertBanner = (spec: AlertBannerWrapper, providersBackstage: UiFactoryBackstageProviders): SketchSpec =>
  // For using the alert banner inside a dialog
  Container.sketch({
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
          classes: [ 'tox-notification__icon' ]
        },
        components: [
          Button.sketch({
            dom: {
              tag: 'button',
              classes: [ 'tox-button', 'tox-button--naked', 'tox-button--icon' ],
              innerHtml: Icons.get(spec.icon, providersBackstage.icons),
              attributes: {
                title: providersBackstage.translate(spec.iconTooltip)
              }
            },
            // TODO: aria label this button!
            action: (comp) => {
              AlloyTriggers.emitWith(comp, formActionEvent, { name: 'alert-banner', value: spec.url });
            }
          })
        ]
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