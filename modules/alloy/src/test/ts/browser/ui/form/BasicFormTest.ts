import { ApproxStructure, Assertions, GeneralSteps, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Value } from '@ephox/sugar';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Form } from 'ephox/alloy/api/ui/Form';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { HtmlSelect } from 'ephox/alloy/api/ui/HtmlSelect';
import { Input } from 'ephox/alloy/api/ui/Input';
import * as TestForm from 'ephox/alloy/test/form/TestForm';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { FormParts } from 'ephox/alloy/ui/types/FormTypes';

UnitTest.asynctest('Basic Form', (success, failure) => {

  const formAntSpec = {
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

  const formBullSpec = {
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

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Form.sketch((parts: FormParts) => {
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

  }, (doc, body, gui, component, store) => {
    const helper = TestForm.helper(component);

    const sAssertDisplay = (inputText, selectValue) => {
      return Step.sync(() => {
        Assertions.assertStructure(
          'Checking that HTML select and text input have right contents',
          ApproxStructure.build((s, str, arr) => {
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
            'form.bull': 'select-b-init'
          }),

          sAssertDisplay('ant-value', 'select-b-init')
        ])
      ),

      Logger.t(
        'Setting "form.ant" and "form.bull" to valid values',
        GeneralSteps.sequence([
          helper.sSetRep({
            'form.ant': 'ant-value',
            'form.bull': 'select-b-other'
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
          Step.sync(() => {
            const field = Form.getField(component, 'form.bull').getOrDie('Could not find field');
            Assertions.assertEq('Checking value', 'select-b-other', Value.get(field.element()));
          })
        ])
      )
    ];
  }, () => { success(); }, failure);
});
