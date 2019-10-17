import { ApproxStructure, Assertions, Chain, Guard, NamedChain } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { HTMLElement } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import { Css, Element, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { NotificationApi } from 'tinymce/core/api/NotificationManager';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('NotificationManagerImpl test', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const cOpenNotification = (type: 'info' | 'warning' | 'error' | 'success', text: string, progressBar = false) => Chain.mapper(() => {
      return editor.notificationManager.open({ type, text, progressBar });
    });

    const cCloseNotification = Chain.op((notification: NotificationApi) => {
      notification.close();
    });

    const cSetText = (text: string) => Chain.op((notification: NotificationApi) => {
      notification.text(text);
    });

    const cSetProgress = (progress: number) => Chain.op((notification: NotificationApi) => {
      notification.progressBar.value(progress);
    });

    const cAssertPosition = (prefix: string, x: number, y: number, diff: number = 5) => Chain.op((notification: NotificationApi) => {
      const elem = Traverse.parent(Element.fromDom(notification.getEl())).getOrDie() as Element<HTMLElement>;
      const top = parseInt(Css.get(elem, 'top').replace('px', ''), 10);
      const left =  parseInt(Css.get(elem, 'left').replace('px', ''), 10);
      Assertions.assertEq(`${prefix} top position should be ${y}px~=${top}px`, true, Math.abs(y - top) < diff);
      Assertions.assertEq(`${prefix} left position should be ${x}px~=${left}px`, true, Math.abs(x - left) < diff);
    });

    const cAssertStructure = (label: string, type: string, message: string, progress?: number) => Chain.op((notification: NotificationApi) => {
      Assertions.assertStructure(label, ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          attrs: {
            role: str.is('alert')
          },
          classes: [
            arr.has('tox-notification'),
            arr.has(`tox-notification--${type}`)
          ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-notification__icon') ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-notification__body') ],
              children: [
                s.element('p', {
                  children: [ s.text(str.is(message)) ]
                })
              ]
            }),
            ...progress !== undefined ? [
              s.element('div', {
                classes: [ arr.has('tox-progress-bar'), arr.has('tox-progress-indicator') ],
                children: [
                  s.element('div', {
                    classes: [ arr.has('tox-bar-container')],
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-bar') ],
                        styles: {
                          width: str.is(`${progress}%`)
                        }
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('tox-text') ],
                    children: [ s.text(str.is(`${progress}%`))]
                  })
                ]
              })
            ] : [],
            s.element('button', {
              classes: [
                arr.has('tox-notification__dismiss'),
                arr.has('tox-button'),
                arr.has('tox-button--naked'),
                arr.has('tox-button--icon')
              ],
              children: [
                s.element('div', {
                  attrs: {
                    'aria-label': str.is('Close')
                  },
                  classes: [ arr.has('tox-icon') ]
                })
              ]
            })
          ]
        });
      }), Element.fromDom(notification.getEl()));
    });

    Chain.pipeline([
      Chain.control(
        NamedChain.asChain([
          NamedChain.write('nError', cOpenNotification('error', 'Message 1')),
          NamedChain.write('nWarn', cOpenNotification('warning', 'Message 2')),
          NamedChain.write('nInfo', cOpenNotification('info', 'Message 3')),
          NamedChain.write('nSuccess', cOpenNotification('success', 'Message 4')),

          // Check initial structure
          NamedChain.direct('nError', cAssertStructure('Check error notification structure', 'error', 'Message 1'), '_'),
          NamedChain.direct('nWarn', cAssertStructure('Check warning notification structure', 'warning', 'Message 2'), '_'),
          NamedChain.direct('nInfo', cAssertStructure('Check info notification structure', 'info', 'Message 3'), '_'),
          NamedChain.direct('nSuccess', cAssertStructure('Check success notification structure', 'success', 'Message 4'), '_'),

          // Check items are positioned so that they are stacked
          NamedChain.direct('nError', cAssertPosition('Error notification', 220, -200), '_'),
          NamedChain.direct('nWarn', cAssertPosition('Warning notification', 220, -152), '_'),
          NamedChain.direct('nInfo', cAssertPosition('Info notification', 220, -104), '_'),
          NamedChain.direct('nSuccess', cAssertPosition('Success notification', 220, -56), '_'),

          NamedChain.direct('nError', cCloseNotification, '_'),

          NamedChain.direct('nWarn', cAssertPosition('Warning notification', 220, -200), '_'),
          NamedChain.direct('nInfo', cAssertPosition('Info notification', 220, -150), '_'),
          NamedChain.direct('nSuccess', cAssertPosition('Success notification', 220, -100), '_'),

          NamedChain.direct('nInfo', cCloseNotification, '_'),

          NamedChain.direct('nWarn', cAssertPosition('Warning notification', 220, -200), '_'),
          NamedChain.direct('nSuccess', cAssertPosition('Success notification', 220, -150), '_'),

          NamedChain.direct('nWarn', cCloseNotification, '_'),
          NamedChain.direct('nSuccess', cCloseNotification, '_')
        ]),
        Guard.addLogging('Check notification stacking and structure')
      ),

      Chain.control(
        Chain.fromChains([
          // Change the text and make sure it updates
          cOpenNotification('success', 'Message'),
          cAssertStructure('Check initial notification structure', 'success', 'Message'),
          cSetText('Success message'),
          cAssertStructure('Check success notification structure', 'success', 'Success message'),
          cCloseNotification
        ]),
        Guard.addLogging('Check updating notification text content')
      ),

      Chain.control(
        Chain.fromChains([
          cOpenNotification('success', 'Message', true),
          cAssertStructure('Check initial notification structure', 'success', 'Message', 0),
          cSetProgress(50),
          cAssertStructure('Check notification structure with 50% progress', 'success', 'Message', 50),
          cSetProgress(100),
          cAssertStructure('Check notification structure with 100% progress', 'success', 'Message', 100),
          cCloseNotification
        ]),
        Guard.addLogging('Check notification progress bar')
      )
    ], onSuccess, onFailure);
  },
  {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    width: 600
  }, success, failure);
});
