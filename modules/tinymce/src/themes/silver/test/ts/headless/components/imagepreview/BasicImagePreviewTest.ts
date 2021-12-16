import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { AlloyComponent, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { ImagePanelData, renderImagePreview } from 'tinymce/themes/silver/ui/dialog/ImagePreview';

// Dupe from the image panel. This definitely belongs somewhere else.
const loadImage = (image: SugarElement<HTMLImageElement>): Promise<SugarElement<HTMLImageElement>> => new Promise((resolve) => {
  const loaded = () => {
    image.dom.removeEventListener('load', loaded);
    resolve(image);
  };

  if (image.dom.complete) {
    resolve(image);
  } else {
    image.dom.addEventListener('load', loaded);
  }
});

describe('headless.tinymce.themes.silver.components.imagepreview.BasicImagePreviewTest', () => {
  const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderImagePreview({
      name: 'test-panel',
      height: Optional.some('200px'),
      width: Optional.some('200px'),
    })
  ));

  const findImage = (component) => UiFinder.findIn<HTMLImageElement>(component.element, 'img').getOrDie();

  const assertImageState = (label: string, component: AlloyComponent, url: string) => {
    const node = findImage(component).dom;
    assert.equal(node.src, url, label + ' - checking "src" attribute');
  };

  const setPanelState = (component: AlloyComponent, state: ImagePanelData) => {
    Representing.setValue(component, state);
  };

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) =>
        s.element('div', {
          classes: [ arr.has('tox-imagepreview') ],
          styles: {
            width: str.is('200px'),
            height: str.is('200px')
          },
          children: [
            s.element('div', {
              classes: [ arr.has('tox-imagepanel__container') ],
              children: [
                s.element('img', {
                  classes: [ arr.has('tox-imagepanel__image') ],
                }),
              ]
            })
          ]
        })),
      hook.component().element
    );
  });

  it('URL update', () => {
    const component = hook.component();
    assertImageState('Initial image panel state', component, '');
    setPanelState(component, {
      url: testImageUrl,
      zoom: Optional.none()
    });
    assertImageState('set URL state', component, testImageUrl);
  });

  it('zoom update', async () => {
    const component = hook.component();
    setPanelState(component, {
      url: testImageUrl,
      zoom: Optional.some(1.5)
    });
    await loadImage(findImage(component));
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) =>
        s.element('div', {
          classes: [ arr.has('tox-imagepreview') ],
          styles: {
            width: str.is('200px'),
            height: str.is('200px')
          },
          children: [
            s.element('div', {
              classes: [ arr.has('tox-imagepanel__container') ],
              styles: {
                top: str.is('99.25px'),
                left: str.is('99.25px'),
                width: str.is('1.5px'),
                height: str.is('1.5px')
              },
              children: [
                s.element('img', {
                  classes: [ arr.has('tox-imagepanel__image') ],
                }),
              ]
            })
          ]
        })),
      hook.component().element
    );
  });
});
