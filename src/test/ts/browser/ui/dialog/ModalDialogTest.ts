import { ApproxStructure, Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Result } from '@ephox/katamari';
import { Class } from '@ephox/sugar';
import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Tabstopping from 'ephox/alloy/api/behaviour/Tabstopping';
import Toggling from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import Container from 'ephox/alloy/api/ui/Container';
import ModalDialog from 'ephox/alloy/api/ui/ModalDialog';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('ModalDialogTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return Sinks.relativeSink();

  }, function (doc, body, gui, sink, store) {
    const focusAndTab = Behaviour.derive([
      Focusing.config({ }),
      Tabstopping.config({ })
    ]);

    const pDraghandle = ModalDialog.parts().draghandle({
      dom: {
        tag: 'div',
        styles: {
          width: '100px',
          height: '40px',
          background: 'black'
        }
      }
    });

    const pTitle = ModalDialog.parts().title({
      dom: {
        tag: 'div',
        innerHtml: 'Title',
        classes: [ 'test-dialog-title' ]
      },
      behaviours: focusAndTab,
      components: [ ]
    });

    const pClose = ModalDialog.parts().close({
      dom: {
        tag: 'div',
        innerHtml: 'X'
      },
      components: [ ]
    });

    const pBody = ModalDialog.parts().body({
      dom: {
        tag: 'div',
        classes: [ 'test-dialog-body' ]
      },
      behaviours: Behaviour.derive([
        Tabstopping.config({ }),
        Focusing.config({ }),
        Toggling.config({
          toggleClass: 'untabbable'
        })
      ]),
      components: [
        Container.sketch({
          dom: {
            innerHtml: '<p>This is something else</p>'
          }
        })
      ]
    });

    const pFooter = ModalDialog.parts().footer({
      dom: {
        tag: 'div',
        classes: [ 'test-dialog-footer' ],
        styles: {
          // Needs size to get focus.
          height: '10px',
          border: '1px solid green'
        }
      },
      behaviours: focusAndTab,
      components: [ ]
    });

    const dialog = GuiFactory.build(
      ModalDialog.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-dialog' ],
          styles: {
            background: 'white'
          }
        },
        components: [
          pDraghandle,
          pTitle,
          pClose,
          pBody,
          pFooter
        ],

        dragBlockClass: 'drag-blocker',
        lazySink () {
          return Result.value(sink);
        },

        useTabstopAt (elem) {
          return !Class.has(elem, 'untabbable');
        },

        modalBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('modal-events', [
            AlloyEvents.runOnAttached(store.adder('modal.attached'))
          ])
        ]),

        onEscape: store.adderH('dialog.escape'),
        onExecute: store.adderH('dialog.execute'),

        parts: {
          blocker: {
            dom: {
              styles: {
                'z-index': '1000000000',
                'background': 'rgba(0, 0, 100, 0.5)'
              },
              classes: [ 'test-dialog-blocker' ]
            }
          }
        }
      })
    );

    const sCheckDialogStructure = function (label, expected) {
      return Logger.t(
        label,
        Chain.asStep({ }, [
          Chain.inject(gui.element()),
          UiFinder.cFindIn('.test-dialog'),
          Chain.op(function (dlg) {
            Assertions.assertStructure('Checking dialog structure', expected, dlg);
          })
        ])
      );
    };

    return [
      Logger.t('No dialog should be in DOM before it appears', UiFinder.sNotExists(gui.element(), '.test-dialog')),
      Logger.t('No dialog blocker should be in DOM before it appears', UiFinder.sNotExists(gui.element(), '.test-dialog-blocker')),
      Step.sync(function () {
        ModalDialog.show(dialog);
      }),
      Logger.t('After showing, dialog should be in DOM', UiFinder.sExists(gui.element(), '.test-dialog')),
      store.sAssertEq('Attached event should have fired', [ 'modal.attached' ]),
      store.sClear,

      Logger.t('After showing, dialog blocker should be in DOM', UiFinder.sExists(gui.element(), '.test-dialog-blocker')),
      sCheckDialogStructure('After showing', ApproxStructure.build(function (s, str, arr) {
        return s.element('div', {
          classes: [ arr.has('test-dialog') ],
          children: [
            s.element('div', { }),
            s.element('div', { html: str.is('Title'), classes: [ arr.has('test-dialog-title') ] }),
            s.element('div', { html: str.is('X') }),
            s.element('div', {
              classes: [ arr.has('test-dialog-body') ],
              children: [
                s.element('div', {
                  children: [
                    s.element('p', { html: str.is('This is something else') })
                  ]
                })
              ]
            }),
            s.element('div', { classes: [ arr.has('test-dialog-footer') ] })
          ]
        });
      })),

      FocusTools.sTryOnSelector('Focus should be on title', doc, '.test-dialog-title'),
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      FocusTools.sTryOnSelector('Focus should be on body now', doc, '.test-dialog-body'),
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      FocusTools.sTryOnSelector('Focus should be on footer now', doc, '.test-dialog-footer'),
      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector('Focus should be back to body now', doc, '.test-dialog-body'),
      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector('Focus should be back to title now', doc, '.test-dialog-title'),

      Step.sync(function () {
        const body = ModalDialog.getBody(dialog);
        Toggling.on(body);
      }),

      Keyboard.sKeydown(doc, Keys.tab(), { }),
      FocusTools.sTryOnSelector('Focus should skip untabbable body', doc, '.test-dialog-footer'),

      store.sAssertEq('Should be clear before <esc> and <enter>', [ ]),
      Keyboard.sKeydown(doc, Keys.enter(), { }),
      store.sAssertEq('After pressing <enter>', [ 'dialog.execute' ]),
      store.sClear,
      Keyboard.sKeydown(doc, Keys.escape(), { }),
      store.sAssertEq('After pressing <esc>', [ 'dialog.escape' ]),

      Step.sync(function () {
        const body = ModalDialog.getBody(dialog);
        Assertions.assertStructure('Checking body of dialog', ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            classes: [ arr.has('test-dialog-body') ]
          });
        }), body.element());
      }),

      Step.sync(function () {
        ModalDialog.hide(dialog);
      }),
      Logger.t('After hiding, dialog should no longer be in DOM', UiFinder.sNotExists(gui.element(), '.test-dialog')),
      Logger.t('After hiding, dialog blocker should no longer be in DOM', UiFinder.sNotExists(gui.element(), '.test-dialog-blocker'))
    ];
  }, function () { success(); }, failure);
});
