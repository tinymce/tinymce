// TODO: Expose properly through alloy.
import { ApproxStructure, Assertions, Cleaner, Logger, Step, Waiter } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell, Fun, Global } from '@ephox/katamari';
import { Class, SugarElement } from '@ephox/sugar';
import Resource from 'tinymce/core/api/Resource';
import Delay from 'tinymce/core/api/util/Delay';
import Promise from 'tinymce/core/api/util/Promise';
import { renderCustomEditor } from 'tinymce/themes/silver/ui/dialog/CustomEditor';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';

declare const tinymce: { Resource: Resource };

const install = () => {
  const origTiny = Global.tinymce;
  Global.tinymce = {
    Resource
  };
  const uninstall = () => {
    Global.tinymce = origTiny;
  };
  return uninstall;
};

UnitTest.asynctest('CustomEditor component Test', (success, failure) => {
  const cleanup = Cleaner();
  cleanup.add(install());
  const resolveInit = Cell(false);
  const customEditorValue = Cell('zztop');

  tinymce.Resource.add('BasicCustomEditorTest', (e: HTMLElement) => new Promise((resolve) => {
    const intervalId = Delay.setInterval(() => {
      if (resolveInit.get()) {
        Delay.clearInterval(intervalId);
        Class.add(SugarElement.fromDom(e), 'my-custom-editor');
        resolve({
          setValue(s: string) { customEditorValue.set(s); },
          getValue() { return customEditorValue.get(); },
          destroy: Fun.noop
        });
      }
    }, 100);
  }));

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      renderCustomEditor({
        type: 'customeditor',
        name: 'customeditor',
        tag: 'textarea',
        scriptId: 'BasicCustomEditorTest',
        scriptUrl: '/custom/404', // using the cache
        settings: undefined
      })
    ),
    (_doc, _body, _gui, component, _store) => [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, _str, arr) => s.element('div', {
          children: [
            s.element('textarea', {
              classes: [ arr.not('my-custom-editor') ]
            })
          ]
        })),
        component.element
      ),

      RepresentingSteps.sAssertRoundtrip(
        'Roundtripping before initialised',
        component,
        'foo'
      ),

      Logger.t(
        'Set to initialised',
        Step.sync(() => {
          resolveInit.set(true);
        })
      ),

      Waiter.sTryUntil(
        'Waiting for CustomEditor init',
        Assertions.sAssertStructure(
          'Checking structure after init',
          ApproxStructure.build((s, _str, arr) => s.element('div', {
            children: [
              s.element('textarea', {
                classes: [ arr.has('my-custom-editor') ]
              })
            ]
          })),
          component.element
        )
      ),

      RepresentingSteps.sAssertRoundtrip(
        'Roundtripping after initialised',
        component,
        'bar'
      )
    ],
    cleanup.wrap(success), cleanup.wrap(failure)
  );
});
