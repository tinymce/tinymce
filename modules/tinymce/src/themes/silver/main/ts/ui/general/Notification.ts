import {
  AlloyComponent, AlloySpec, Behaviour, Button, DomFactory, Focusing, GuiFactory, Keying, Memento, Replacing, Sketcher,
  Tabstopping,
  Tooltipping,
  UiSketcher
} from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Arr, Id, Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as HtmlSanitizer from '../core/HtmlSanitizer';
import * as Icons from '../icons/Icons';

export interface NotificationSketchApis {
  updateProgress: (comp: AlloyComponent, percent: number) => void;
  updateText: (comp: AlloyComponent, text: string) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface NotificationSketchSpec extends Sketcher.SingleSketchSpec {
  readonly text: string;
  readonly level?: 'info' | 'warn' | 'warning' | 'error' | 'success';
  readonly icon?: string;
  readonly progress: boolean;
  readonly onAction: Function;
  readonly iconProvider: Icons.IconProvider;
  readonly backstageProvider: UiFactoryBackstageProviders;
}

// tslint:disable-next-line:no-empty-interface
export interface NotificationSketchDetail extends Sketcher.SingleSketchDetail {
  readonly text: string;
  readonly level: Optional<'info' | 'warn' | 'warning' | 'error' | 'success'>;
  readonly icon: Optional<string>;
  readonly onAction: Function;
  readonly progress: boolean;
  readonly iconProvider: Icons.IconProvider;
  readonly backstageProvider: UiFactoryBackstageProviders;
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
  const notificationTextId = Id.generate('notification-text');
  const memBannerText = Memento.record({
    dom: DomFactory.fromHtml(`<p id=${notificationTextId}>${HtmlSanitizer.sanitizeHtmlString(detail.backstageProvider.translate(detail.text))}</p>`),
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  });

  const renderPercentBar = (percent: number) => ({
    dom: {
      tag: 'div',
      classes: [ 'tox-bar' ],
      styles: {
        width: `${percent}%`
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
    detail.level.bind((level) => Optional.from(notificationIconMap[level])).toArray()
  ]);

  const memButton = Memento.record(Button.sketch({
    dom: {
      tag: 'button',
      classes: [ 'tox-notification__dismiss', 'tox-button', 'tox-button--naked', 'tox-button--icon' ],
      attributes: {
        'aria-label': detail.backstageProvider.translate('Close')
      }
    },
    components: [
      Icons.render('close', {
        tag: 'span',
        classes: [ 'tox-icon' ],
      }, detail.iconProvider)
    ],
    buttonBehaviours: Behaviour.derive([
      Tabstopping.config({}),
      Tooltipping.config({
        ...detail.backstageProvider.tooltips.getConfig({
          tooltipText: detail.backstageProvider.translate('Close')
        })
      })
    ]),
    action: (comp) => {
      detail.onAction(comp);
    }
  }));

  const notificationIconSpec = Icons.renderFirst(iconChoices, { tag: 'div', classes: [ 'tox-notification__icon' ] }, detail.iconProvider);
  const notificationBodySpec = {
    dom: {
      tag: 'div',
      classes: [ 'tox-notification__body' ]
    },
    components: [
      memBannerText.asSpec()
    ],
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  };

  const components: AlloySpec[] = [ notificationIconSpec, notificationBodySpec ];

  return {
    uid: detail.uid,
    dom: {
      tag: 'div',
      attributes: {
        'role': 'alert',
        'aria-labelledby': notificationTextId
      },
      classes: detail.level.map((level) => [ 'tox-notification', 'tox-notification--in', `tox-notification--${level}` ]).getOr(
        [ 'tox-notification', 'tox-notification--in' ]
      )
    },
    behaviours: Behaviour.derive([
      Tabstopping.config({ }),
      Focusing.config({ }),
      Keying.config({
        mode: 'special',
        onEscape: (comp) => {
          detail.onAction(comp);
          return Optional.some(true);
        }
      })
    ]),
    components: components
      .concat(detail.progress ? [ memBannerProgress.asSpec() ] : [])
      .concat([ memButton.asSpec() ]),
    apis
  };
};

export const Notification: NotificationSketcher = Sketcher.single({
  name: 'Notification',
  factory,
  configFields: [
    FieldSchema.option('level'),
    FieldSchema.required('progress'),
    FieldSchema.option('icon'),
    FieldSchema.required('onAction'),
    FieldSchema.required('text'),
    FieldSchema.required('iconProvider'),
    FieldSchema.required('backstageProvider'),
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
