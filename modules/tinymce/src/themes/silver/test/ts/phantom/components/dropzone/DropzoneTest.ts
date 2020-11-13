import { ApproxStructure, Assertions, Chain, Logger, Step, UiFinder } from '@ephox/agar';
import { AlloyTriggers, Composing, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderDropZone } from 'tinymce/themes/silver/ui/dialog/Dropzone';
import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('Dropzone component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      renderDropZone({
        name: 'drop1',
        label: Optional.some('Dropzone Label')
      }, TestProviders)
    ),
    (_doc, _body, _gui, component, _store) => [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          children: [
            s.element('label', {
              classes: [ arr.has('tox-label') ],
              html: str.is('Dropzone Label')
            }),
            s.element('div', { })
          ]
        })),
        component.element
      ),

      Logger.t(
        'Trigger drop on zone',
        Chain.asStep(component.element, [
          UiFinder.cFindIn('.tox-dropzone'),
          Chain.binder(component.getSystem().getByDom),
          Chain.op((zone) => {
            // TODO: Add 'drop' to NativeEvents
            AlloyTriggers.emitWith(zone, 'drop', {
              raw: {
                dataTransfer: {
                  files: [
                    { name: 'image1.png' },
                    { name: 'image2.svg' },
                    { name: 'image3.jpg' },
                    { name: 'image4.jpeg' },
                    { name: 'image5.jpe' },
                    { name: 'image6.jfi' },
                    { name: 'image7.jfif' },
                    { name: 'image8.gif' },
                    { name: 'image9.bmp' },
                    { name: 'image10.webp' }
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
          { name: 'image3.jpg' },
          { name: 'image4.jpeg' },
          { name: 'image5.jpe' },
          { name: 'image6.jfi' },
          { name: 'image7.jfif' },
          { name: 'image8.gif' },
          { name: 'image9.bmp' },
          { name: 'image10.webp' }
        ], filesValue);
      })
    ],
    success,
    failure
  );
});
