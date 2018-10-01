import { AlloyComponent, Behaviour, Button, GuiFactory, Memento, Replacing, Sketcher, UiSketcher, AlloySpec } from '@ephox/alloy';
import { FieldSchema } from '@ephox/boulder';
import { Option, Arr } from '@ephox/katamari';
import { IconProvider, get as getIcon, getFirstOr, getDefaultFirstOr } from '../icons/Icons';

export interface NotificationSketchApis {
  updateProgress: (comp: AlloyComponent, percent: number) => void;
  updateText: (comp: AlloyComponent, text: string) => void;
}

// tslint:disable-next-line:no-empty-interface
export interface NotificationSketchSpec extends Sketcher.SingleSketchSpec {
  text: string;
  level: 'info' | 'warn' | 'error' | 'success';
  icon: Option<string>;
  progress: boolean;
  onAction: Function;
  iconProvider: IconProvider;
}

// tslint:disable-next-line:no-empty-interface
export interface NotificationSketchDetail extends Sketcher.SingleSketchDetail {
  text: () => string;
  level: () => Option<'info' | 'warn' | 'error' | 'success'>;
  icon: () => Option<string>;
  onAction: () => Function;
  progress: () => Boolean;
  iconProvider: () => IconProvider;
}

export interface NotificationSketcher extends Sketcher.SingleSketch<NotificationSketchSpec, NotificationSketchDetail>, NotificationSketchApis {

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
      innerHtml: detail.text()
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
      classes: detail.progress() ? [ 'tox-progress-bar', 'tox-progress-indicator' ] : [ 'tox-progress-bar' ]
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

  const iconChoices = Arr.map(
    Arr.flatten([
      detail.icon().toArray(),
      detail.level().toArray(),
      detail.level().bind((level) => Option.from(notificationIconMap[level])).toArray()
    ]),
    (icon) => `icon-${icon}`
  );

  return {
    uid: detail.uid(),
    dom: {
      tag: 'div',
      attributes: {
        role: 'alert'
      },
      classes: detail.level().map((level) => [ 'tox-notification', 'tox-notification--in', `tox-notification--${level}` ]).getOr(
        [ 'tox-notification', 'tox-notification--in' ]
      )
    },
    components: [{
        dom: {
          tag: 'div',
          classes: [ 'tox-notification__icon' ],
          innerHtml: getFirstOr(iconChoices, detail.iconProvider(), () => {
            return getDefaultFirstOr(iconChoices, () => '');
          })
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
    .concat(detail.progress() ? [memBannerProgress.asSpec()] : [])
    .concat(Button.sketch({
        dom: {
          tag: 'button',
          classes: [ 'tox-notification__dismiss', 'tox-button', 'tox-button--naked', 'tox-button--icon' ]
        },
        components: [{
          dom: {
            tag: 'div',
            classes: ['tox-icon'],
            innerHtml: getIcon('icon-close', detail.iconProvider())
          }
        }],
        // TODO: aria label this button!
        action: (comp) => {
          detail.onAction()(comp);
        }
      })
    ),
    apis
  };
};

export const Notification = Sketcher.single<NotificationSketchSpec, NotificationSketchDetail>({
  name: 'Notification',
  factory,
  configFields: [
    FieldSchema.option('level'),
    FieldSchema.strict('progress'),
    FieldSchema.strict('icon'),
    FieldSchema.strict('onAction'),
    FieldSchema.strict('text'),
    FieldSchema.strict('iconProvider'),
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
