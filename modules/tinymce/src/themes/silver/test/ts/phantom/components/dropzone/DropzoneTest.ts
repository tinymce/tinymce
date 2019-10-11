import { ApproxStructure, Assertions, Chain, Logger, Step, UiFinder } from '@ephox/agar';
import { AlloyTriggers, Composing, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';

import { renderDropZone } from 'tinymce/themes/silver/ui/dialog/Dropzone';
import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('Dropzone component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderDropZone({
          name: 'drop1',
          label: Option.some('Dropzone Label'),
        }, TestProviders)
      );
    },
    (doc, body, gui, component, store) => {
      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              children: [
                s.element('label', {
                  classes: [ arr.has('tox-label') ],
                  html: str.is('Dropzone Label')
                }),
                s.element('div', { })
              ]
            });
          }),
          component.element()
        ),

        Logger.t(
          'Trigger drop on zone',
          Chain.asStep(component.element(), [
            UiFinder.cFindIn('.tox-dropzone'),
            Chain.binder(component.getSystem().getByDom),
            Chain.op((zone) => {
              // TODO: Add 'drop' to NativeEvents
              AlloyTriggers.emitWith(zone, 'drop', {
                raw: {
                  dataTransfer: {
                    files: [
                      { name: 'image1.png' },
                      { name: 'image2.bmp' },
                      { name: 'image3.jpg' }
                    ]
                  }
                }
              });
            })
          ])
        ),

        Step.sync(() => {
          const zone = Composing.getCurrent(component).getOrDie(
            'Failed trying to get the zone from the container'
          );
          const filesValue = Representing.getValue(zone);
          Assertions.assertEq('Checking value of dropzone', [
            { name: 'image1.png' },
            { name: 'image3.jpg' }
          ], filesValue);
        })
      ];
    },
    success,
    failure
  );
});
