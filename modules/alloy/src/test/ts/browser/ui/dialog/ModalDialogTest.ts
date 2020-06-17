import {
  ApproxStructure, Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Mouse, NamedChain, Step, StructAssert, UiFinder
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
import { Attr, Class, Compare } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import { ModalDialog } from 'ephox/alloy/api/ui/ModalDialog';
import * as Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('ModalDialogTest', (success, failure) => {
  GuiSetup.setup((_store, _doc, _body) => Sinks.relativeSink(), (doc, _body, gui, sink, store) => {
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
        lazySink(comp) {
          Assertions.assertEq('Checking dialog passed through to lazySink', true, Compare.eq(comp.element(), dialog.element()));
          return Result.value(sink);
        },

        useTabstopAt(elem) {
          return !Class.has(elem, 'untabbable');
        },

        modalBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('modal-events-1', [
            AlloyEvents.runOnAttached(store.adder('modal.attached.1'))
          ]),
          AddEventsBehaviour.config('modal-events-2', [
            AlloyEvents.runOnAttached(store.adder('modal.attached.2'))
          ])
        ]),

        eventOrder: {
          [SystemEvents.attachedToDom()]: [ 'modal-events-1', 'modal-events-2' ]
        },

        onEscape: store.adderH('dialog.escape'),
        onExecute: store.adderH('dialog.execute'),

        parts: {
          blocker: {
            dom: {
              tag: 'div',
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

    const sCheckDialogStructure = (label: string, expected: StructAssert) => Logger.t(
      label,
      Chain.asStep({ }, [
        Chain.inject(gui.element()),
        UiFinder.cFindIn('.test-dialog'),
        Chain.op((dlg) => {
          Assertions.assertStructure('Checking dialog structure', expected, dlg);
        })
      ])
    );

    return [
      Logger.t('No dialog should be in DOM before it appears', UiFinder.sNotExists(gui.element(), '.test-dialog')),
      Logger.t('No dialog blocker should be in DOM before it appears', UiFinder.sNotExists(gui.element(), '.test-dialog-blocker')),
      Step.sync(() => {
        ModalDialog.show(dialog);
      }),
      Logger.t('After showing, dialog should be in DOM', UiFinder.sExists(gui.element(), '.test-dialog')),
      store.sAssertEq('Attached event should have fired', [ 'modal.attached.1', 'modal.attached.2' ]),
      store.sClear,

      Logger.t('After showing, dialog blocker should be in DOM', UiFinder.sExists(gui.element(), '.test-dialog-blocker')),
      sCheckDialogStructure('After showing', ApproxStructure.build((s, str, arr) => s.element('div', {
        attrs: {
          'aria-modal': str.is('true'),
          'role': str.is('dialog')
        },
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
      }))),

      Logger.t('Dialog should have aria-labelledby with title id', Chain.asStep(gui.element(), [
        NamedChain.asChain([
          NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn('.test-dialog-title'), 'title'),
          NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn('.test-dialog'), 'dialog'),
          NamedChain.bundle((f) => {
            const titleId = Attr.get(f.title, 'id') || '';
            Assertions.assertEq('titleId should be set', true, Attr.has(f.title, 'id'));
            Assertions.assertEq('titleId should not be empty', true, titleId.length > 0);
            const dialogLabelledBy = Attr.get(f.dialog, 'aria-labelledby');
            Assertions.assertEq('Labelledby blah better error message', titleId, dialogLabelledBy);
            return Result.value(f);
          })
        ])
      ])),

      Logger.t('Dialog should have aria-describedby with body describe id', Chain.asStep(gui.element(), [
        NamedChain.asChain([
          NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn('.test-dialog-body'), 'body'),
          NamedChain.direct(NamedChain.inputName(), UiFinder.cFindIn('.test-dialog'), 'dialog'),
          NamedChain.bundle((f) => {
            const describeId = Attr.get(f.body, 'id') || '';
            Assertions.assertEq('describeId should be set', true, Attr.has(f.body, 'id'));
            Assertions.assertEq('describeId should not be empty', true, describeId.length > 0);
            const dialogDescribedBy = Attr.get(f.dialog, 'aria-describedby');
            Assertions.assertEq('aria-describedby should be set to describeId', describeId, dialogDescribedBy);
            return Result.value(f);
          })
        ])
      ])),

      FocusTools.sTryOnSelector('Focus should be on title', doc, '.test-dialog-title'),
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      FocusTools.sTryOnSelector('Focus should be on body now', doc, '.test-dialog-body'),
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      FocusTools.sTryOnSelector('Focus should be on footer now', doc, '.test-dialog-footer'),
      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector('Focus should be back to body now', doc, '.test-dialog-body'),
      Keyboard.sKeydown(doc, Keys.tab(), { shift: true }),
      FocusTools.sTryOnSelector('Focus should be back to title now', doc, '.test-dialog-title'),

      Mouse.sTrueClickOn(doc, '.test-dialog-blocker'),
      FocusTools.sTryOnSelector('Focus should move to first focusable element when clicking the blocker', doc, '.test-dialog-title'),

      Step.sync(() => {
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

      Step.sync(() => {
        const body = ModalDialog.getBody(dialog);
        Assertions.assertStructure('Checking body of dialog', ApproxStructure.build((s, _str, arr) => s.element('div', {
          classes: [ arr.has('test-dialog-body') ]
        })), body.element());
      }),

      Step.sync(() => {
        const footer = ModalDialog.getFooter(dialog);
        Assertions.assertStructure('Checking footer of dialog', ApproxStructure.build((s, _str, arr) => s.element('div', {
          classes: [ arr.has('test-dialog-footer') ]
        })), footer.element());
      }),

      Step.sync(() => {
        ModalDialog.hide(dialog);
      }),
      Logger.t('After hiding, dialog should no longer be in DOM', UiFinder.sNotExists(gui.element(), '.test-dialog')),
      Logger.t('After hiding, dialog blocker should no longer be in DOM', UiFinder.sNotExists(gui.element(), '.test-dialog-blocker')),

      Step.sync(() => {
        ModalDialog.show(dialog);
      }),

      sCheckDialogStructure(
        'Checking initial structure after showing (not busy)',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('test-dialog') ],
          attrs: {
            'aria-busy': str.none()
          },
          children: [
            s.anything(), // Draghandle
            s.anything(), // Title
            s.anything(), // X
            s.element('div', { classes: [ arr.has('test-dialog-body') ] }),
            s.element('div', { classes: [ arr.has('test-dialog-footer') ] })
          ]
        }))
      ),

      Logger.t(
        'Set the Dialog to "Busy"',
        Step.sync(() => {
          ModalDialog.setBusy(dialog, (_d, bs) => ({
            dom: {
              tag: 'div',
              classes: [ 'test-busy-class' ],
              innerHtml: 'Loading'
            },
            behaviours: bs
          }));
        })
      ),

      sCheckDialogStructure(
        'Checking setBusy structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('test-dialog') ],
          attrs: {
            'aria-busy': str.is('true')
          },
          children: [
            s.anything(), // Draghandle
            s.anything(), // Title
            s.anything(), // X
            s.element('div', { classes: [ arr.has('test-dialog-body') ] }),
            s.element('div', { classes: [ arr.has('test-dialog-footer') ] }),
            s.element('div', {
              classes: [ arr.has('test-busy-class') ],
              html: str.is('Loading')
            })
          ]
        }))
      ),

      FocusTools.sTryOnSelector('Focus should be on loading message', doc, '.test-busy-class'),
      // NOTE: Without real key testing ... this isn't really that useful.
      Keyboard.sKeydown(doc, Keys.tab(), { }),
      FocusTools.sTryOnSelector('Focus should STILL be on loading message', doc, '.test-busy-class'),

      Logger.t(
        'Set the dialog to busy again without setting it to idle first',
        Step.sync(() => {
          ModalDialog.setBusy(dialog, (_d, _bs) => ({
            dom: {
              tag: 'div',
              classes: [ 'test-busy-second-class' ],
              innerHtml: 'Still loading'
            }
          }));
        })
      ),

      sCheckDialogStructure(
        'Checking second setBusy structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('test-dialog') ],
          attrs: {
            'aria-busy': str.is('true')
          },
          children: [
            s.anything(), // Draghandle
            s.anything(), // Title
            s.anything(), // X
            s.element('div', { classes: [ arr.has('test-dialog-body') ] }),
            s.element('div', { classes: [ arr.has('test-dialog-footer') ] }),
            s.element('div', {
              classes: [ arr.has('test-busy-second-class') ],
              html: str.is('Still loading')
            })
          ]
        }))
      ),

      Logger.t(
        'Set the dialog to idle',
        Step.sync(() => {
          ModalDialog.setIdle(dialog);
        })
      ),

      sCheckDialogStructure(
        'Checking setIdle structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('test-dialog') ],
          attrs: {
            'aria-busy': str.none()
          },
          children: [
            s.anything(), // Draghandle
            s.anything(), // Title
            s.anything(), // X
            s.element('div', { classes: [ arr.has('test-dialog-body') ] }),
            s.element('div', { classes: [ arr.has('test-dialog-footer') ] })
          ]
        }))
      )
    ];
  }, () => { success(); }, failure);
});
