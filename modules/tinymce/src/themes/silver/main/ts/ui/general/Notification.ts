/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloySpec, Behaviour, Button, GuiFactory, Memento, Replacing, Sketcher, UiSketcher } from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Option } from '@ephox/katamari';
import { TranslatedString, Untranslated } from 'tinymce/core/api/util/I18n';
import { get as getIcon, getFirst, IconProvider } from '../icons/Icons';

export interface NotificationSketchApis {
  updateProgress: (comp: AlloyComponent, percent: number) => void;
  updateText: (comp: AlloyComponent, text: string) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface NotificationSketchSpec extends Sketcher.SingleSketchSpec {
  text: string;
  level: 'info' | 'warn' | 'warning' | 'error' | 'success';
  icon: Option<string>;
  closeButton?: boolean;
  progress: boolean;
  onAction: Function;
  iconProvider: IconProvider;
  translationProvider: (text: Untranslated) => TranslatedString;
}

// tslint:disable-next-line:no-empty-interface
export interface NotificationSketchDetail extends Sketcher.SingleSketchDetail {
  text: string;
  level: Option<'info' | 'warn' | 'warning' | 'error' | 'success'>;
  icon: Option<string>;
  closeButton: boolean;
  onAction: Function;
  progress: boolean;
  iconProvider: IconProvider;
  translationProvider: (text: Untranslated) => TranslatedString;
}

export interface NotificationSketcher extends Sketcher.SingleSketch<NotificationSketchSpec>, NotificationSketchApis {

}

const notificationIconMap = {
  success: 'checkmark',
  error: 'warning',
  err: 'error',
  warning: 'warning',
  warn: 'warning',
  info: 'info'
};

const factory: UiSketcher.SingleSketchFactory<NotificationSketchDetail, NotificationSketchSpec> = (detail) => {
  // For using the alert banner as a standalone banner
  const memBannerText = Memento.record({
    dom: {
      tag: 'p',
      innerHtml: detail.translationProvider(detail.text)
    },
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  });

  const renderPercentBar = (percent: number) => ({
    dom: {
      tag: 'div',
      classes: [ 'tox-bar' ],
      attributes: {
        style: `width: ${percent}%`
      }
    }
  });

  const renderPercentText = (percent: number) => ({
    dom: {
      tag: 'div',
      classes: [ 'tox-text' ],
      innerHtml: `${percent}%`
    }
  });

  const memBannerProgress = Memento.record({
    dom: {
      tag: 'div',
      classes: detail.progress ? [ 'tox-progress-bar', 'tox-progress-indicator' ] : [ 'tox-progress-bar' ]
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-bar-container' ]
        },
        components: [
          renderPercentBar(0)
        ]
      },
      renderPercentText(0)
    ],
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  });

  const updateProgress: NotificationSketchApis['updateProgress'] = (comp, percent) => {
    if (comp.getSystem().isConnected()) {
      memBannerProgress.getOpt(comp).each((progress) => {
        Replacing.set(progress, [
          {
            dom: {
              tag: 'div',
              classes: [ 'tox-bar-container' ]
            },
            components: [
              renderPercentBar(percent)
            ]
          },
          renderPercentText(percent)
        ]);
      });
    }
  };

  const updateText: NotificationSketchApis['updateText'] = (comp, text) => {
    if (comp.getSystem().isConnected()) {
      const banner = memBannerText.get(comp);
      Replacing.set(banner, [
        GuiFactory.text(text)
      ]);
    }
  };

  const apis: NotificationSketchApis = {
    updateProgress,
    updateText
  };

  const iconChoices = Arr.flatten([
    detail.icon.toArray(),
    detail.level.toArray(),
    detail.level.bind((level) => Option.from(notificationIconMap[level])).toArray()
  ]);

  return {
    uid: detail.uid,
    dom: {
      tag: 'div',
      attributes: {
        role: 'alert'
      },
      classes: detail.level.map((level) => [ 'tox-notification', 'tox-notification--in', `tox-notification--${level}` ]).getOr(
        [ 'tox-notification', 'tox-notification--in' ]
      )
    },
    components: [{
        dom: {
          tag: 'div',
          classes: [ 'tox-notification__icon' ],
          innerHtml: getFirst(iconChoices, detail.iconProvider)
        }
      } as AlloySpec,
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-notification__body'],
        },
        components: [
          memBannerText.asSpec()
        ],
        behaviours: Behaviour.derive([
          Replacing.config({ })
        ])
      } as AlloySpec
    ]
    .concat(detail.progress ? [memBannerProgress.asSpec()] : [])
    .concat(!detail.closeButton ? [] : [Button.sketch({
        dom: {
          tag: 'button',
          classes: [ 'tox-notification__dismiss', 'tox-button', 'tox-button--naked', 'tox-button--icon' ]
        },
        components: [{
          dom: {
            tag: 'div',
            classes: ['tox-icon'],
            innerHtml: getIcon('close', detail.iconProvider),
            attributes: {
              'aria-label': detail.translationProvider('Close')
            }
          }
        }],
        action: (comp) => {
          detail.onAction(comp);
        }
      })]
    ),
    apis
  };
};

export const Notification: NotificationSketcher = Sketcher.single({
  name: 'Notification',
  factory,
  configFields: [
    FieldSchema.option('level'),
    FieldSchema.strict('progress'),
    FieldSchema.strict('icon'),
    FieldSchema.strict('onAction'),
    FieldSchema.strict('text'),
    FieldSchema.strict('iconProvider'),
    FieldSchema.strict('translationProvider'),
    FieldSchema.defaultedBoolean('closeButton', true)
  ],
  apis: {
    updateProgress: (apis: NotificationSketchApis, comp: AlloyComponent, percent: number) => {
      apis.updateProgress(comp, percent);
    },
    updateText: (apis: NotificationSketchApis, comp: AlloyComponent, text: string) => {
      apis.updateText(comp, text);
    }
  }
}) as NotificationSketcher;
