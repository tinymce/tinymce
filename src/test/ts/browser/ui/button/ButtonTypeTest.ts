import { Assertions } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Step } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Memento from 'ephox/alloy/api/component/Memento';
import Button from 'ephox/alloy/api/ui/Button';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Attr } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Browser Test: .ui.button.ButtonTypeTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  // This button specifies the type, so it should not change to "button"
  var memSubmitButton = Memento.record(
    Button.sketch({
      dom: {
        tag: 'button',
        attributes: {
          type: 'submit'
        }
      }
    })
  );

  var memButton = Memento.record(
    Button.sketch({
      dom: {
        tag: 'button'
      }
    })
  );

  var memSpan = Memento.record(
    Button.sketch({
      dom: {
        tag: 'span'
      }
    })
  );

  var memTypedSpan = Memento.record(
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
  GuiSetup.setup(function (store, doc, body) {
    
    return GuiFactory.build({
      dom: {
        tag: 'div'
      },
      components: [
        memSubmitButton.asSpec(),
        memButton.asSpec(),
        memSpan.asSpec(),
        memTypedSpan.asSpec()
      ]
    });
  }, function (doc, body, gui, component, store) {
    var sCheck = function (label, expected, memento) {
      return Logger.t(
        label,
        Step.sync(function () {
          var button = memento.get(component);
          Assertions.assertEq('"type" attribute', expected, Attr.get(button.element(), 'type'));
        })
      );
    };

    return [
      sCheck('Submit button', 'submit', memSubmitButton),
      sCheck('Button', 'button', memButton),
      sCheck('Span', undefined, memSpan),
      sCheck('Typed Span', 'submit', memTypedSpan)
    ];
  }, success, failure);
});

