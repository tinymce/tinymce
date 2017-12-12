import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Step } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Form from 'ephox/alloy/api/ui/Form';
import FormField from 'ephox/alloy/api/ui/FormField';
import HtmlSelect from 'ephox/alloy/api/ui/HtmlSelect';
import Input from 'ephox/alloy/api/ui/Input';
import TestForm from 'ephox/alloy/test/form/TestForm';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Value } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Basic Form', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var formAntSpec = {
    uid: 'input-ant',
    dom: {
      tag: 'div'
    },
    components: [
      FormField.parts().field({
        factory: Input,
        data: 'Init'
      }),
      FormField.parts().label({
        dom: { tag: 'label', innerHtml: 'a' },
        components: [ ]
      })
    ]
  };

  var formBullSpec = {
    uid: 'select-bull',
    dom: {
      tag: 'div'
    },
    components: [
      FormField.parts().field({
        factory: HtmlSelect,
        options: [
          { value: 'select-b-init', text: 'Select-b-init' },
          { value: 'select-b-other', text: 'Select-b-other' }
        ]
      }),
      FormField.parts().label({ dom: { tag: 'label', innerHtml: 'a' }, components: [ ] })
    ]
  };

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Form.sketch(function (parts) {
        return {
          dom: {
            tag: 'div'
          },
          components: [
            parts.field('form.ant', FormField.sketch(formAntSpec)),
            parts.field('form.bull', FormField.sketch(formBullSpec))
          ]
        };
      })
    );

  }, function (doc, body, gui, component, store) {
    var helper = TestForm.helper(component);

    var sAssertDisplay = function (inputText, selectValue) {
      return Step.sync(function () {
        Assertions.assertStructure(
          'Checking that HTML select and text input have right contents',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              children: [
                s.element('div', {
                  children: [
                    s.element('input', { value: str.is(inputText) }),
                    s.element('label', {})
                  ]
                }),
                s.element('div', {
                  children: [
                    s.element('select', { value: str.is(selectValue) }),
                    s.element('label', { })
                  ]
                })
              ]
            });
          }),
          component.element()
        );
      });
    };

    return [
      Logger.t(
        'Initial values',
        GeneralSteps.sequence([
          helper.sAssertRep({
            'form.ant': 'Init',
            'form.bull': 'select-b-init'
          }),
          sAssertDisplay('Init', 'select-b-init')
        ])
      ),

      Logger.t(
        'Setting "form.ant" to ant-value',
        GeneralSteps.sequence([
          helper.sSetRep({
            'form.ant': 'ant-value'
          }),

          helper.sAssertRep({
            'form.ant': 'ant-value',
            'form.bull': 'select-b-init'
          }),

          sAssertDisplay('ant-value', 'select-b-init')
        ])
      ),

      Logger.t(
        'Setting multiple values but the select value is invalid',
        GeneralSteps.sequence([
          helper.sSetRep({
            'form.ant': 'ant-value',
            'form.bull': 'select-b-not-there'
          }),

          helper.sAssertRep({
            'form.ant': 'ant-value',
            'form.bull':'select-b-init'
          }),

          sAssertDisplay('ant-value', 'select-b-init')
        ])
      ),

      Logger.t(
        'Setting "form.ant" and "form.bull" to valid values',
        GeneralSteps.sequence([
          helper.sSetRep({
            'form.ant': 'ant-value',
            'form.bull':'select-b-other'
          }),

          helper.sAssertRep({
            'form.ant': 'ant-value',
            'form.bull': 'select-b-other'
          }),

          sAssertDisplay('ant-value', 'select-b-other')
        ])
      ),

      Logger.t(
        'Retrieve the bull field directly and check its value',
        GeneralSteps.sequence([
          Step.sync(function () {
            var field = Form.getField(component, 'form.bull').getOrDie('Could not find field');
            Assertions.assertEq('Checking value', 'select-b-other', Value.get(field.element()));
          })
        ])
      )
    ];
  }, function () { success(); }, failure);
});

