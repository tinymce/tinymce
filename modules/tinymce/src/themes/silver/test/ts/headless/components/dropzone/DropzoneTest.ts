import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { AlloyTriggers, Composing, GuiFactory, NativeEvents, Representing } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { renderDropZone } from 'tinymce/themes/silver/ui/dialog/Dropzone';

import * as GuiSetup from '../../../module/GuiSetup';
import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.dropzone.DropzoneTest', () => {
  const hook = GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderDropZone({
      context: 'any',
      name: 'drop1',
      label: Optional.some('Dropzone Label'),
      buttonLabel: Optional.none(),
      dropAreaLabel: Optional.none(),
      allowedFileTypes: Optional.none(),
      allowedFileExtensions: Optional.none(),
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
          s.element('div', {
            children: [
              s.element('div', {
                children: [
                  s.element('p', {
                    html: str.is('Drop an image here')
                  }),
                  s.element('button', {
                    html: str.is('Browse for an image<input type="file" accept="image/*" style="display: none;">')
                  }),
                ]
              })
            ]
          })
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

  context('TINY-13278: buttonLabel, dropAreaLabel, allowedFileTypes and allowedFileExtensions', () => {
    const hook = GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderDropZone({
        context: 'any',
        name: 'drop1',
        label: Optional.some('Dropzone Label'),
        buttonLabel: Optional.some('Button Label'),
        dropAreaLabel: Optional.some('Drop Area Label'),
        allowedFileTypes: Optional.some('text/plain'),
        allowedFileExtensions: Optional.some([ 'txt' ]),
      }, TestProviders, Optional.none())
    ));

    it('TINY-13278: Check basic structure', () => {
      Assertions.assertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          children: [
            s.element('label', {
              classes: [ arr.has('tox-label') ],
              html: str.is('Dropzone Label')
            }),
            s.element('div', {
              children: [
                s.element('div', {
                  children: [
                    s.element('p', {
                      html: str.is('Drop Area Label')
                    }),
                    s.element('button', {
                      html: str.is('Button Label<input type="file" accept="text/plain" style="display: none;">')
                    }),
                  ]
                })
              ]
            })
          ]
        })),
        hook.component().element
      );
    });

    it('TINY-13278: Check drop on zone', () => {
      const component = hook.component();
      const dropzone = UiFinder.findIn(component.element, '.tox-dropzone').getOrDie();
      const zone = component.getSystem().getByDom(dropzone).getOrDie();
      AlloyTriggers.emitWith(zone, NativeEvents.drop(), {
        raw: {
          dataTransfer: {
            files: [
              { name: 'text1.txt' },
              { name: 'text2.doc' }
            ]
          }
        }
      });

      const comp = Composing.getCurrent(component).getOrDie('Failed trying to get the zone from the container');
      const filesValue = Representing.getValue(comp);
      assert.deepEqual(filesValue, [
        { name: 'text1.txt' }
      ], 'Checking value of dropzone');
    });
  });
});
