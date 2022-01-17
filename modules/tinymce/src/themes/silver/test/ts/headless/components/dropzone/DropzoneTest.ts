import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { AlloyTriggers, Composing, GuiFactory, NativeEvents, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { renderDropZone } from 'tinymce/themes/silver/ui/dialog/Dropzone';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.dropzone.DropzoneTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderDropZone({
      name: 'drop1',
      label: Optional.some('Dropzone Label')
    }, TestProviders, Optional.none())
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        children: [
          s.element('label', {
            classes: [ arr.has('tox-label') ],
            html: str.is('Dropzone Label')
          }),
          s.element('div', {})
        ]
      })),
      hook.component().element
    );
  });

  it('Check drop on zone', () => {
    const component = hook.component();
    const dropzone = UiFinder.findIn(component.element, '.tox-dropzone').getOrDie();
    const zone = component.getSystem().getByDom(dropzone).getOrDie();
    AlloyTriggers.emitWith(zone, NativeEvents.drop(), {
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
            { name: 'image10.webp' },
            { name: 'image11.PNG' },
            { name: 'image12.WEBP' }
          ]
        }
      }
    });

    const comp = Composing.getCurrent(component).getOrDie('Failed trying to get the zone from the container');
    const filesValue = Representing.getValue(comp);
    assert.deepEqual(filesValue, [
      { name: 'image1.png' },
      { name: 'image3.jpg' },
      { name: 'image4.jpeg' },
      { name: 'image5.jpe' },
      { name: 'image6.jfi' },
      { name: 'image7.jfif' },
      { name: 'image8.gif' },
      { name: 'image9.bmp' },
      { name: 'image10.webp' },
      { name: 'image11.PNG' },
      { name: 'image12.WEBP' }
    ], 'Checking value of dropzone');
  });
});
