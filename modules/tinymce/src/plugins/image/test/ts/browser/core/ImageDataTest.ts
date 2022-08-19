import { ApproxStructure, Assertions, StructAssert } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import * as ImageData from 'tinymce/plugins/image/core/ImageData';

type ImageData = ImageData.ImageData;

interface ImageDataExt {
  readonly model: ImageData;
  readonly image: SugarElement<HTMLImageElement>;
  readonly parent: SugarElement<HTMLElement>;
}

describe('browser.tinymce.plugins.image.core.ImageDataTest', () => {
  const normalizeCss = (cssText: string | undefined) => {
    const css = DOMUtils.DOM.styles.parse(cssText);
    const newCss: Record<string, string> = {};

    Arr.each(Obj.keys(css).sort(), (key) => {
      newCss[key] = css[key];
    });

    return DOMUtils.DOM.styles.serialize(newCss);
  };

  const create = (data: ImageData) => SugarElement.fromDom(ImageData.create(normalizeCss, data));

  const createHtml = (html: string) => SugarElement.fromHtml<HTMLElement>(html);

  const readFromImage = (elm: SugarElement<HTMLElement>): ImageDataExt => {
    const img = SugarNode.isTag('img')(elm) ? elm : SelectorFind.descendant<HTMLImageElement>(elm, 'img').getOrDie('failed to find image');
    return { model: ImageData.read(normalizeCss, img.dom), image: img, parent: elm };
  };

  const writeToImage = (data: ImageDataExt) => {
    ImageData.write(normalizeCss, data.model, data.image.dom);
  };

  const updateModel = (props: Partial<ImageData>, data: ImageDataExt) => ({
    model: { ...data.model, ...props },
    image: data.image,
    parent: data.parent
  });

  const assertModel = (model: ImageData, data: ImageDataExt) => {
    assert.deepEqual(data.model, model);
  };

  const assertStructure = (structure: StructAssert, data: any) => {
    Assertions.assertStructure('', structure, data.parent);
  };

  const assertImage = (data: ImageDataExt) => {
    assert.isTrue(ImageData.isImage(data.image.dom), 'Should be an image');
  };

  const assertFigure = (data: ImageDataExt) => {
    assert.isTrue(ImageData.isFigure(data.image.dom.parentNode), 'Parent should be a figure');
  };

  it('TBA: getStyleValue from image data', () => {
    assert.equal(ImageData.getStyleValue(normalizeCss, ImageData.defaultData()), '', 'Should not produce any styles');
    assert.equal(ImageData.getStyleValue(normalizeCss, { ...ImageData.defaultData(), border: '1' }), 'border-width: 1px;', 'Should produce border width');
    assert.equal(ImageData.getStyleValue(normalizeCss, { ...ImageData.defaultData(), borderStyle: 'solid' }), 'border-style: solid;', 'Should produce style');
    assert.equal(ImageData.getStyleValue(normalizeCss, { ...ImageData.defaultData(), border: '1', borderStyle: 'solid' }), 'border-style: solid; border-width: 1px;', 'Should produce style & border');
    assert.equal(ImageData.getStyleValue(normalizeCss, { ...ImageData.defaultData(), style: 'border: 1px solid red', border: '2', borderStyle: 'dotted' }), 'border: 2px dotted red;', 'Should produce compact border');
  });

  it('TBA: Create image from data', () => {
    const image = create({
      src: 'some.gif',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'class',
      style: 'border: 1px solid red',
      caption: false,
      hspace: '2',
      vspace: '3',
      border: '4',
      borderStyle: 'dotted',
      isDecorative: false
    });
    const data = readFromImage(image);
    assertModel({
      src: 'some.gif',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'class',
      style: 'border: 4px dotted red; margin: 3px 2px;',
      caption: false,
      hspace: '2',
      vspace: '3',
      border: '4',
      borderStyle: 'dotted',
      isDecorative: false
    }, data);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some.gif'),
          alt: str.is('alt'),
          title: str.is('title'),
          width: str.is('100'),
          height: str.is('200'),
          class: str.is('class')
        },
        styles: {
          'border-width': str.is('4px'),
          'border-style': str.is('dotted'),
          'border-color': str.is('red'),
          'margin-top': str.is('3px'),
          'margin-bottom': str.is('3px'),
          'margin-left': str.is('2px'),
          'margin-right': str.is('2px')
        }
      });
    }), data);
    assertImage(data);
  });

  it('TBA: Create image with empty fields except src', () => {
    const image = create({
      src: 'some.gif',
      alt: '',
      title: '',
      width: '',
      height: '',
      class: '',
      style: '',
      caption: false,
      hspace: '',
      vspace: '',
      border: '',
      borderStyle: '',
      isDecorative: false
    });
    const data = readFromImage(image);
    assertModel({
      src: 'some.gif',
      alt: '',
      title: '',
      width: '',
      height: '',
      class: '',
      style: '',
      caption: false,
      hspace: '',
      vspace: '',
      border: '',
      borderStyle: '',
      isDecorative: false
    }, data);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some.gif'),
          alt: str.is(''),
          title: str.none('no title'),
          width: str.none('no width'),
          height: str.none('no height'),
          class: str.none('no class')
        },
        styles: {
          'border-width': str.none('no style'),
          'border-style': str.none('no style'),
          'border-color': str.none('no style'),
          'margin-top': str.none('no style'),
          'margin-bottom': str.none('no style'),
          'margin-left': str.none('no style'),
          'margin-right': str.none('no style')
        }
      });
    }), data);
    assertImage(data);
  });

  it('TBA: Create figure from data', () => {
    const image = create({
      src: 'some.gif',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'class',
      style: 'border: 1px solid red',
      caption: true,
      hspace: '2',
      vspace: '3',
      border: '4',
      borderStyle: 'dotted',
      isDecorative: false
    });
    const data = readFromImage(image);
    assertModel({
      src: 'some.gif',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'class',
      style: 'border: 4px dotted red; margin: 3px 2px;',
      caption: true,
      hspace: '2',
      vspace: '3',
      border: '4',
      borderStyle: 'dotted',
      isDecorative: false
    }, data);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('figure', {
        attrs: {
          contenteditable: str.is('false'),
          class: str.is('image')
        },
        children: [
          s.element('img', {
            attrs: {
              src: str.is('some.gif'),
              alt: str.is('alt'),
              title: str.is('title'),
              width: str.is('100'),
              height: str.is('200'),
              class: str.is('class')
            },
            styles: {
              'border-width': str.is('4px'),
              'border-style': str.is('dotted'),
              'border-color': str.is('red'),
              'margin-top': str.is('3px'),
              'margin-bottom': str.is('3px'),
              'margin-left': str.is('2px'),
              'margin-right': str.is('2px')
            }
          }),
          s.element('figcaption', {
            attrs: {
              contenteditable: str.is('true')
            },
            children: [
              s.text(str.is('Caption'))
            ]
          })
        ]
      });
    }), data);
    assertFigure(data);
  });

  it('TBA: Create decorative image from data', () => {
    const image = create({
      src: 'some.gif',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'class',
      style: 'border: 1px solid red',
      caption: false,
      hspace: '2',
      vspace: '3',
      border: '4',
      borderStyle: 'dotted',
      isDecorative: true
    });
    const data = readFromImage(image);
    assertModel({
      src: 'some.gif',
      alt: '',
      title: 'title',
      width: '100',
      height: '200',
      class: 'class',
      style: 'border: 4px dotted red; margin: 3px 2px;',
      caption: false,
      hspace: '2',
      vspace: '3',
      border: '4',
      borderStyle: 'dotted',
      isDecorative: true
    }, data);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some.gif'),
          alt: str.is(''),
          title: str.is('title'),
          width: str.is('100'),
          height: str.is('200'),
          class: str.is('class'),
          role: str.is('presentation')
        },
        styles: {
          'border-width': str.is('4px'),
          'border-style': str.is('dotted'),
          'border-color': str.is('red'),
          'margin-top': str.is('3px'),
          'margin-bottom': str.is('3px'),
          'margin-left': str.is('2px'),
          'margin-right': str.is('2px')
        }
      });
    }), data);
    assertImage(data);
  });

  it('TBA: Read/write model to simple image without change', () => {
    const image = createHtml('<img src="some.gif">');
    const data = readFromImage(image);
    assertModel({
      src: 'some.gif',
      alt: '',
      title: '',
      width: '',
      height: '',
      class: '',
      style: '',
      caption: false,
      hspace: '',
      vspace: '',
      border: '',
      borderStyle: '',
      isDecorative: false
    }, data);
    writeToImage(data);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some.gif'),
          style: str.none('no style'),
          width: str.none('no width'),
          height: str.none('no height'),
          alt: str.none('no alt'),
          title: str.none('no title')
        },
        styles: {
          'border-width': str.none('no width'),
          'border-style': str.none('no style'),
          'border-color': str.none('no color'),
          'margin-top': str.none('no top'),
          'margin-bottom': str.none('no bottom'),
          'margin-left': str.none('no left'),
          'margin-right': str.none('no right')
        }
      });
    }), data);
  });

  it('TBA: Read/write model to complex image without change', () => {
    const image = createHtml('<img src="some.gif" class="class" width="100" height="200" style="margin: 1px 2px; border: 1px solid red" alt="alt" title="title">');
    const data = readFromImage(image);
    assertModel({
      src: 'some.gif',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'class',
      style: 'border: 1px solid red; margin: 1px 2px;',
      caption: false,
      hspace: '2',
      vspace: '1',
      border: '1',
      borderStyle: 'solid',
      isDecorative: false
    }, data);
    writeToImage(data);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some.gif'),
          alt: str.is('alt'),
          title: str.is('title'),
          width: str.is('100'),
          height: str.is('200'),
          class: str.is('class')
        },
        styles: {
          'border-width': str.is('1px'),
          'border-style': str.is('solid'),
          'border-color': str.is('red'),
          'margin-top': str.is('1px'),
          'margin-bottom': str.is('1px'),
          'margin-left': str.is('2px'),
          'margin-right': str.is('2px')
        }
      });
    }), data);
  });

  it('TBA: Read/write model to simple image with changes', () => {
    const image = createHtml('<img src="some.gif">');
    const data = readFromImage(image);
    const newData = updateModel({
      src: 'some2.gif',
      alt: 'alt',
      title: 'title',
      width: '100',
      height: '200',
      class: 'class',
      style: 'border: 1px solid red;',
      caption: false,
      hspace: '1',
      vspace: '2',
      border: '3',
      borderStyle: 'dotted',
      isDecorative: false
    }, data);
    writeToImage(newData);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some2.gif'),
          alt: str.is('alt'),
          title: str.is('title'),
          width: str.is('100'),
          height: str.is('200'),
          class: str.is('class')
        },
        styles: {
          'border-width': str.is('3px'),
          'border-style': str.is('dotted'),
          'border-color': str.is('red'),
          'margin-top': str.is('2px'),
          'margin-bottom': str.is('2px'),
          'margin-left': str.is('1px'),
          'margin-right': str.is('1px')
        }
      });
    }), newData);
  });

  it('TBA: Read/write model to complex image with changes', () => {
    const image = createHtml('<img src="some.gif" class="class" width="100" height="200" style="margin: 1px 2px; border: 1px solid red" alt="alt" title="title">');
    const data = readFromImage(image);
    const newData = updateModel({
      src: 'some2.gif',
      alt: 'alt2',
      title: 'title2',
      width: '101',
      height: '201',
      class: 'class2',
      style: 'border: 1px solid blue;',
      caption: false,
      hspace: '3',
      vspace: '4',
      border: '4',
      borderStyle: 'dotted',
      isDecorative: false
    }, data);
    writeToImage(newData);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some2.gif'),
          alt: str.is('alt2'),
          title: str.is('title2'),
          width: str.is('101'),
          height: str.is('201'),
          class: str.is('class2')
        },
        styles: {
          'border-width': str.is('4px'),
          'border-style': str.is('dotted'),
          'border-color': str.is('blue'),
          'margin-top': str.is('4px'),
          'margin-bottom': str.is('4px'),
          'margin-left': str.is('3px'),
          'margin-right': str.is('3px')
        }
      });
    }), newData);
  });

  it('TBA: write null as alt will remove the attribute', () => {
    const image = createHtml('<img src="some.gif" alt="alt">');
    const data = readFromImage(image);
    const newData = updateModel({
      src: 'some2.gif',
      alt: null,
      title: '',
      width: '',
      height: '',
      class: '',
      style: '',
      caption: false,
      hspace: '',
      vspace: '',
      border: '',
      borderStyle: '',
      isDecorative: false
    }, data);
    writeToImage(newData);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some2.gif'),
          alt: str.none('no alt')
        }
      });
    }), newData);
  });

  it('TBA: Toggle caption on', () => {
    const image = createHtml('<div><img src="some.gif"></div>');
    const data = readFromImage(image);
    const newData = updateModel({
      caption: true
    }, data);
    writeToImage(newData);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('div', {
        children: [
          s.element('figure', {
            attrs: {
              contenteditable: str.is('false'),
              class: str.is('image')
            },
            children: [
              s.element('img', {
                attrs: {
                  src: str.is('some.gif')
                }
              }),
              s.element('figcaption', {
                attrs: {
                  contenteditable: str.is('true')
                },
                children: [
                  s.text(str.is('Caption'))
                ]
              })
            ]
          })
        ]
      });
    }), newData);
  });

  it('TBA: Toggle caption off', () => {
    const image = createHtml('<div><figure class="image" contenteditable="false"><img src="some.gif"><figcaption contenteditable="true">Caption</figcaption></figure></div>');
    const data = readFromImage(image);
    const newData = updateModel({
      caption: false
    }, data);
    writeToImage(newData);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('div', {
        children: [
          s.element('img', {
            attrs: {
              src: str.is('some.gif')
            }
          })
        ]
      });
    }), newData);
  });

  it('TBA: Update figure image data', () => {
    const image = createHtml('<figure class="image" contenteditable="false"><img src="some.gif"><figcaption contenteditable="true">Caption</figcaption></figure>');
    const data = readFromImage(image);
    const newData = updateModel({
      src: 'some2.gif'
    }, data);
    writeToImage(newData);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('figure', {
        attrs: {
          contenteditable: str.is('false'),
          class: str.is('image')
        },
        children: [
          s.element('img', {
            attrs: {
              src: str.is('some2.gif')
            }
          }),
          s.element('figcaption', {
            attrs: {
              contenteditable: str.is('true')
            },
            children: [
              s.text(str.is('Caption'))
            ]
          })
        ]
      });
    }), newData);
  });

  it('TBA: Read/write model to image with style size without change', () => {
    const image = createHtml('<img src="some.gif" style="width: 100px; height: 200px">');
    const data = readFromImage(image);
    assertModel({
      src: 'some.gif',
      alt: '',
      title: '',
      width: '100',
      height: '200',
      class: '',
      style: 'height: 200px; width: 100px;',
      caption: false,
      hspace: '',
      vspace: '',
      border: '',
      borderStyle: '',
      isDecorative: false
    }, data);
    writeToImage(data);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some.gif'),
          width: str.none('no width'),
          height: str.none('no height'),
          alt: str.none('no alt'),
          title: str.none('no title')
        },
        styles: {
          'width': str.is('100px'),
          'height': str.is('200px'),
          'border-width': str.none('no width'),
          'border-style': str.none('no style'),
          'border-color': str.none('no color'),
          'margin-top': str.none('no top'),
          'margin-bottom': str.none('no bottom'),
          'margin-left': str.none('no left'),
          'margin-right': str.none('no right')
        }
      });
    }), data);
  });

  it('TBA: Read/write model to image with style size with size change', () => {
    const image = createHtml('<img src="some.gif" style="width: 100px; height: 200px">');
    const data = readFromImage(image);
    assertModel({
      src: 'some.gif',
      alt: '',
      title: '',
      width: '100',
      height: '200',
      class: '',
      style: 'height: 200px; width: 100px;',
      caption: false,
      hspace: '',
      vspace: '',
      border: '',
      borderStyle: '',
      isDecorative: false
    }, data);
    const newData = updateModel({
      width: '150',
      height: '250'
    }, data);
    writeToImage(newData);
    assertStructure(ApproxStructure.build((s, str) => {
      return s.element('img', {
        attrs: {
          src: str.is('some.gif'),
          width: str.none('no width'),
          height: str.none('no height'),
          alt: str.none('no alt'),
          title: str.none('no title')
        },
        styles: {
          'width': str.is('150px'),
          'height': str.is('250px'),
          'border-width': str.none('no width'),
          'border-style': str.none('no style'),
          'border-color': str.none('no color'),
          'margin-top': str.none('no top'),
          'margin-bottom': str.none('no bottom'),
          'margin-left': str.none('no left'),
          'margin-right': str.none('no right')
        }
      });
    }), newData);
  });
});
