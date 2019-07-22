// TODO: Expose properly through alloy.
import { ApproxStructure, Assertions, Logger, Step, Waiter } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Global } from '@ephox/katamari';
import { renderCustomEditor } from 'tinymce/themes/silver/ui/dialog/CustomEditor';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import Scripts from 'tinymce/core/api/Scripts';

UnitTest.asynctest('CustomEditor component Test', (success, failure) => {
  // for this test we have to check the internal state of another script so we store it in globals
  Global.BasicCustomEditorTest = {
    resolveInit: false,
    customEditorValue: 'zztop'
  };
  // Create a fake TinyMCE global with just the Scripts
  Global.tinymce = {
    Scripts
  };

  const dataScript = `data:text/javascript,tinymce.Scripts.add('BasicCustomEditorTest', function (e) {
    var global = typeof window !== 'undefined' ? window : Function('return this;')();
    return new Promise((resolve) => {
    var intervalId = setInterval(() => {
      if (global.BasicCustomEditorTest.resolveInit) {
        clearInterval(intervalId);
        e.className = 'my-custom-editor';
        resolve({
          setValue: function(s) { global.BasicCustomEditorTest.customEditorValue = s; },
          getValue: function() { return global.BasicCustomEditorTest.customEditorValue; },
          destroy: function() {}
        });
      }
    }, 500);
  });
});`;

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderCustomEditor({
          type: 'customeditor',
          name: 'customeditor',
          tag: 'textarea',
          scriptId: 'BasicCustomEditorTest',
          scriptUrl: dataScript,
          settings: undefined
         })
      );
    },
    (doc, body, gui, component, store) => {

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              children: [
                s.element('textarea', {
                  classes: [arr.not('my-custom-editor')]
                })
              ]
            });
          }),
          component.element()
        ),

        RepresentingSteps.sAssertRoundtrip(
          'Roundtripping before initialised',
          component,
          'foo'
        ),

        Logger.t(
          'Set to initialised',
          Step.sync(() => {
            Global.BasicCustomEditorTest.resolveInit = true;
          })
        ),

        Waiter.sTryUntil(
          'Waiting for CustomEditor init',
          Assertions.sAssertStructure(
            'Checking structure after init',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                children: [
                  s.element('textarea', {
                    classes: [arr.has('my-custom-editor')]
                  })
                ]
              });
            }),
            component.element()
          ),
          500,
          5000
        ),

        RepresentingSteps.sAssertRoundtrip(
          'Roundtripping after initialised',
          component,
          'bar'
        )
      ];
    },
    success,
    failure
  );
});
