import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, StructAssert, TestStore, UiFinder } from '@ephox/agar';
import { after, afterEach, before, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';
import { Attribute, Class, Compare, SugarBody, SugarDocument } from '@ephox/sugar';

import * as AddEventsBehaviour from 'ephox/alloy/api/behaviour/AddEventsBehaviour';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { ModalDialog } from 'ephox/alloy/api/ui/ModalDialog';
import * as Sinks from 'ephox/alloy/test/Sinks';

describe('browser.alloy.ui.dialog.ModalDialogTest', () => {
  const focusAndTab = Behaviour.derive([
    Focusing.config({ }),
    Tabstopping.config({ })
  ]);

  const pDraghandle = ModalDialog.parts.draghandle({
    dom: {
      tag: 'div',
      styles: {
        width: '100px',
        height: '40px',
        background: 'black'
      }
    }
  });

  const pTitle = ModalDialog.parts.title({
    dom: {
      tag: 'div',
      innerHtml: 'Title',
      classes: [ 'test-dialog-title' ]
    },
    components: [ ]
  });

  const pClose = ModalDialog.parts.close(
    Button.sketch({
      dom: {
        tag: 'button',
        classes: [ 'test-dialog-close' ],
        innerHtml: 'X',
        attributes: {
          'type': 'button',
          'title': 'Close',
          'aria-label': 'Close'
        }
      },
      buttonBehaviours: Behaviour.derive([
        Tabstopping.config({})
      ]),
      components: [ ]
    })
  );

  const pBody = ModalDialog.parts.body({
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

  const pFooter = ModalDialog.parts.footer({
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

  const makeDialog = (store: TestStore, sink: AlloyComponent) => {
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
        lazySink: (comp: AlloyComponent) => {
          Assertions.assertEq('Checking dialog passed through to lazySink', true, Compare.eq(comp.element, dialog.element));
          return Result.value(sink);
        },

        useTabstopAt: (elem) => {
          return !Class.has(elem, 'untabbable');
        },

        firstTabstop: 1,

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

    return dialog;
  };

  const otherMothership = Gui.create();
  const sink = Sinks.relativeSink();
  otherMothership.add(sink);

  const hook = GuiSetup.bddSetup(
    (store) => makeDialog(store, sink)
  );

  const dialogSelectors = {
    dialog: '.test-dialog',
    title: '.test-dialog-title',
    body: '.test-dialog-body',
    footer: '.test-dialog-footer',
    close: '.test-dialog-close'
  };

  const checkDialogStructure = (label: string, expected: StructAssert) => {
    const dialog = UiFinder.findIn(SugarBody.body(), dialogSelectors.dialog).getOrDie();
    Assertions.assertStructure(label, expected, dialog);
  };

  before(() => {
    Attachment.attachSystem(hook.body(), otherMothership);
  });

  beforeEach(() => {
    hook.store().clear();
    const dialog = hook.component();
    ModalDialog.show(dialog);
  });

  after(() => {
    Attachment.detachSystem(otherMothership);
  });

  afterEach(() => {
    ModalDialog.hide(hook.component());
  });

  it('TINY-9520: Attached event should have fired ', () => {
    const store = hook.store();
    const doc = SugarDocument.getDocument();

    store.assertEq('Should equal to attach event', [ 'modal.attached.1', 'modal.attached.2' ]);

    store.clear();
    store.assertEq('Should be clear before <esc> and <enter>', [ ]);

    Keyboard.activeKeydown(doc, Keys.enter(), { });
    store.assertEq('After pressing <enter>', [ 'dialog.execute' ]);
    store.clear();
    Keyboard.activeKeyup(doc, Keys.escape(), { });
    store.assertEq('After pressing <esc>', [ 'dialog.escape' ]);
  });

  it('TINY-9520: Check dialog structure', () => {
    const dialog = hook.component();

    checkDialogStructure('After showing', ApproxStructure.build((s, str, arr) => s.element('div', {
      attrs: {
        'aria-modal': str.is('true'),
        'role': str.is('dialog')
      },
      classes: [ arr.has('test-dialog') ],
      children: [
        s.element('div', { }),
        s.element('div', { html: str.is('Title'), classes: [ arr.has('test-dialog-title') ] }),
        s.element('button', { html: str.is('X') }),
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
    })));

    const body = ModalDialog.getBody(dialog);
    Assertions.assertStructure('Checking body of dialog', ApproxStructure.build((s, _str, arr) => s.element('div', {
      classes: [ arr.has('test-dialog-body') ]
    })), body.element);

    const footer = ModalDialog.getFooter(dialog);
    Assertions.assertStructure('Checking footer of dialog', ApproxStructure.build((s, _str, arr) => s.element('div', {
      classes: [ arr.has('test-dialog-footer') ]
    })), footer.getOrDie().element);
  });

  it('TINY-9520: Checking aria attribute of dialog', () => {
    const dialog = hook.component();
    const dialogTitle = UiFinder.findIn(dialog.element, dialogSelectors.title).getOrDie();

    const titleId = Attribute.getOpt(dialogTitle, 'id').getOr('');

    Assertions.assertEq('titleId should be set', true, Attribute.has(dialogTitle, 'id'));
    Assertions.assertEq('titleId should not be empty', true, titleId.length > 0);

    const dialogLabelledBy = Attribute.get(dialog.element, 'aria-labelledby');
    Assertions.assertEq('Labelledby blah better error message', titleId, dialogLabelledBy);
  });

  it('TINY-9520: Focus testing', async () => {
    const dialog = hook.component();
    const doc = SugarDocument.getDocument();

    await FocusTools.pTryOnSelector('Focus should be on body now', doc, dialogSelectors.body);
    Keyboard.activeKeydown(doc, Keys.tab(), { });
    await FocusTools.pTryOnSelector('Focus should be on footer now', doc, dialogSelectors.footer);
    Keyboard.activeKeydown(doc, Keys.tab(), { });
    await FocusTools.pTryOnSelector('Focus should be on X close button now', doc, dialogSelectors.close);
    Keyboard.activeKeydown(doc, Keys.tab(), { shift: true });
    await FocusTools.pTryOnSelector('Focus should be back to footer now', doc, dialogSelectors.footer);
    Keyboard.activeKeydown(doc, Keys.tab(), { shift: true });
    await FocusTools.pTryOnSelector('Focus should be back to body now', doc, dialogSelectors.body);
    Keyboard.activeKeydown(doc, Keys.tab(), { shift: true });
    await FocusTools.pTryOnSelector('Focus should be back to X close button now', doc, dialogSelectors.close);

    const dialogBody = ModalDialog.getBody(dialog);
    Toggling.on(dialogBody);

    Keyboard.activeKeydown(doc, Keys.tab(), { }); // Skipping body, jumping directly to footer
    await FocusTools.pTryOnSelector('Focus should skip untabbable body', doc, dialogSelectors.footer);
  });

  it('TINY-9520: Clicking on blocker', async () => {
    const doc = SugarDocument.getDocument();

    Mouse.clickOn(doc, '.test-dialog-blocker');
    await FocusTools.pTryOnSelector('Focus should move to first focusable element when clicking the blocker', doc, dialogSelectors.body);
  });

  it('TINY-10056: Clicking on blocker shouldn\'t focus first focusable when dialog is blocked', async () => {
    const dialog = hook.component();
    const doc = SugarDocument.getDocument();

    ModalDialog.setBusy(dialog, (_d, bs) => ({
      dom: {
        tag: 'div',
        classes: [ 'test-busy-class' ],
        innerHtml: 'Loading',
      },
      behaviours: bs
    }));

    Mouse.clickOn(doc, '.test-dialog-blocker');
    await FocusTools.pTryOnSelector('Focus should move to blocker element when clicking the blocker', doc, '.test-busy-class');

    Mouse.clickOn(doc, '.test-dialog');
    await FocusTools.pTryOnSelector('Focus should move to blocker element when clicking the blocker', doc, '.test-busy-class');

    ModalDialog.setIdle(dialog);
  });

  it('TINY-9520: Dialog busy test', async () => {
    const dialog = hook.component();
    const doc = SugarDocument.getDocument();

    checkDialogStructure('Checking initial structure after showing (not busy)', ApproxStructure.build((s, str, arr) => s.element('div', {
      attrs: {
        'aria-modal': str.is('true'),
        'role': str.is('dialog')
      },
      classes: [ arr.has('test-dialog') ],
      children: [
        s.element('div', { }),
        s.element('div', { html: str.is('Title'), classes: [ arr.has('test-dialog-title') ] }),
        s.element('button', { html: str.is('X') }),
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
    })));

    ModalDialog.setBusy(dialog, (_d, bs) => ({
      dom: {
        tag: 'div',
        classes: [ 'test-busy-class' ],
        innerHtml: 'Loading',
      },
      behaviours: bs
    }));

    checkDialogStructure(
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
    );

    await FocusTools.pTryOnSelector('Focus should be on loading message', doc, '.test-busy-class');
    // NOTE: Without real key testing ... this isn't really that useful.
    Keyboard.sKeydown(doc, Keys.tab(), { });
    await FocusTools.pTryOnSelector('Focus should STILL be on loading message', doc, '.test-busy-class');

    ModalDialog.setBusy(dialog, (_bs) => ({
      dom: {
        tag: 'div',
        classes: [ 'test-busy-second-class' ],
        innerHtml: 'Still loading'
      }
    }));

    checkDialogStructure(
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
    );

    ModalDialog.setIdle(dialog);

    checkDialogStructure(
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
    );
  });
});
