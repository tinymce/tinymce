import { Assertions, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Attribute } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { Button } from 'ephox/alloy/api/ui/Button';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('Browser Test: .ui.button.ButtonTypeTest', (success, failure) => {

  // This button specifies the type, so it should not change to "button"
  const memSubmitButton = Memento.record(
    Button.sketch({
      dom: {
        tag: 'button',
        attributes: {
          type: 'submit'
        }
      }
    })
  );

  const memButton = Memento.record(
    Button.sketch({
      dom: {
        tag: 'button'
      }
    })
  );

  const memSpan = Memento.record(
    Button.sketch({
      dom: {
        tag: 'span'
      }
    })
  );

  const memTypedSpan = Memento.record(
    Button.sketch({
      dom: {
        tag: 'span',
        attributes: {
          type: 'submit'
        }
      }
    })
  );

  /*
   * The purpose of this test is to check that the type attribute is only defaulted
   * when the type is button (and that any specified type does not clobber it)
   */
  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'div'
    },
    components: [
      memSubmitButton.asSpec(),
      memButton.asSpec(),
      memSpan.asSpec(),
      memTypedSpan.asSpec()
    ]
  }), (_doc, _body, _gui, component, _store) => {
    const sCheck = (label: string, expected: string | undefined, memento: Memento.MementoRecord) => Logger.t(
      label,
      Step.sync(() => {
        const button = memento.get(component);
        Assertions.assertEq('"type" attribute', expected, Attribute.get(button.element, 'type'));
      })
    );

    return [
      sCheck('Submit button', 'submit', memSubmitButton),
      sCheck('Button', 'button', memButton),
      sCheck('Span', undefined, memSpan),
      sCheck('Typed Span', 'submit', memTypedSpan)
    ];
  }, success, failure);
});
