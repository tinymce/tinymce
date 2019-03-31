import { Chain, Pipeline, Assertions, ApproxStructure, RawAssertions, Step, Guard, Log } from '@ephox/agar';
import { Element, Html, SelectorFind, Node } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';
import { read, write, create, isImage, isFigure, defaultData, getStyleValue } from 'tinymce/plugins/image/core/ImageData';
import { Merger, Obj, Arr } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

UnitTest.asynctest('browser.tinymce.plugins.image.core.ImageDataTest', (success, failure) => {
  const cSetHtml = (html) => {
    return Chain.control(
      Chain.op(function (elm: Element) {
        Html.set(elm, html);
      }),
      Guard.addLogging('Set html')
    );
  };

  const normalizeCss = (cssText: string) => {
    const css = DOMUtils.DOM.styles.parse(cssText);
    const newCss = {};

    Arr.each(Obj.keys(css).sort(), (key) => {
      newCss[key] = css[key];
    });

    return DOMUtils.DOM.styles.serialize(newCss);
  };

  const cCreate = (data) => {
    return Chain.control(
      Chain.inject(Element.fromDom(create(normalizeCss, data))),
      Guard.addLogging(`Create ${data}`)
    );
  };
  const cReadFromImage = Chain.control(
    Chain.mapper(function (elm: Element) {
      const img = Node.name(elm) === 'img' ? elm : SelectorFind.descendant(elm, 'img').getOrDie('failed to find image');
      return { model: read(normalizeCss, img.dom()), image: img, parent: elm };
    }),
    Guard.addLogging('Read from image')
  );

  const cWriteToImage = Chain.control(
    Chain.op(function (data: any) {
      write(normalizeCss, data.model, data.image.dom());
    }),
    Guard.addLogging('Write to image')
  );

  const cUpdateModel = (props) => {
    return Chain.control(
      Chain.mapper(function (data: any) {
        return { model: Merger.merge(data.model, props), image: data.image, parent: data.parent };
      }),
      Guard.addLogging('Update data model')
    );
  };

  const cAssertModel = (model) => {
    return Chain.control(
      Chain.op(function (data: any) {
        RawAssertions.assertEq('', model, data.model);
      }),
      Guard.addLogging('Assert model')
    );
  };

  const cAssertStructure = (structure) => {
    return Chain.control(
        Chain.op(function (data: any) {
        Assertions.assertStructure('', structure, data.parent);
      }),
      Guard.addLogging('Assert structure')
    );
  };

  const cAssertImage = Chain.control(
    Chain.op(function (data: any) {
      RawAssertions.assertEq('Should be an image', true, isImage(data.image.dom()));
    }),
    Guard.addLogging('Assert image')
  );

  const cAssertFigure = Chain.op(function (data: any) {
    RawAssertions.assertEq('Parent should be a figure', true, isFigure(data.image.dom().parentNode));
  });

  Pipeline.async({}, [
    Log.step('TBA', 'Image: getStyleValue from image data', Step.sync(() => {
      RawAssertions.assertEq('Should not produce any styles', '', getStyleValue(normalizeCss, defaultData()));
      RawAssertions.assertEq('Should produce border width', 'border-width: 1px;', getStyleValue(normalizeCss, Merger.merge(defaultData(), { border: '1' })));
      RawAssertions.assertEq('Should produce style', 'border-style: solid;', getStyleValue(normalizeCss, Merger.merge(defaultData(), { borderStyle: 'solid' })));
      RawAssertions.assertEq('Should produce style & border', 'border-style: solid; border-width: 1px;', getStyleValue(normalizeCss, Merger.merge(defaultData(), { border: '1', borderStyle: 'solid' })));
      RawAssertions.assertEq('Should produce compact border', 'border: 2px dotted red;', getStyleValue(normalizeCss, Merger.merge(defaultData(), { style: 'border: 1px solid red', border: '2', borderStyle: 'dotted' })));
    })),
    Log.chainsAsStep('TBA', 'Image: Create image from data', [
      cCreate({
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
        borderStyle: 'dotted'
      }),
      cReadFromImage,
      cAssertModel({
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
        borderStyle: 'dotted'
      }),
      cAssertStructure(ApproxStructure.build(function (s, str) {
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
      })),
      cAssertImage
    ]),
    Log.chainsAsStep('TBA', 'Image: Create image with empty fields except src', [
      cCreate({
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
        borderStyle: ''
      }),
      cReadFromImage,
      cAssertModel({
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
        borderStyle: ''
      }),
      cAssertStructure(ApproxStructure.build(function (s, str) {
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
      })),
      cAssertImage
    ]),
    Log.chainsAsStep('TBA', 'Image: Create figure from data', [
      cCreate({
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
        borderStyle: 'dotted'
      }),
      cReadFromImage,
      cAssertModel({
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
        borderStyle: 'dotted'
      }),
      cAssertStructure(ApproxStructure.build(function (s, str) {
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
      })),
      cAssertFigure
    ]),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Read/write model to simple image without change', [
      cSetHtml('<img src="some.gif">'),
      cReadFromImage,
      cAssertModel({
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
        borderStyle: ''
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
        return s.element('div', {
          children: [
            s.element('img', {
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
            })
          ]
        });
      }))
    ])),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Read/write model to complex image without change', [
      cSetHtml('<img src="some.gif" class="class" width="100" height="200" style="margin: 1px 2px; border: 1px solid red" alt="alt" title="title">'),
      cReadFromImage,
      cAssertModel({
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
        borderStyle: 'solid'
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
        return s.element('div', {
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
                'border-width': str.is('1px'),
                'border-style': str.is('solid'),
                'border-color': str.is('red'),
                'margin-top': str.is('1px'),
                'margin-bottom': str.is('1px'),
                'margin-left': str.is('2px'),
                'margin-right': str.is('2px')
              }
            })
          ]
        });
      }))
    ])),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Read/write model to simple image with changes', [
      cSetHtml('<img src="some.gif">'),
      cReadFromImage,
      cUpdateModel({
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
        borderStyle: 'dotted'
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
        return s.element('div', {
          children: [
            s.element('img', {
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
            })
          ]
        });
      }))
    ])),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Read/write model to complex image with changes', [
      cSetHtml('<img src="some.gif" class="class" width="100" height="200" style="margin: 1px 2px; border: 1px solid red" alt="alt" title="title">'),
      cReadFromImage,
      cUpdateModel({
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
        borderStyle: 'dotted'
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
        return s.element('div', {
          children: [
            s.element('img', {
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
            })
          ]
        });
      }))
    ])),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Toggle caption on', [
      cSetHtml('<img src="some.gif">'),
      cReadFromImage,
      cUpdateModel({
        caption: true
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
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
      }))
    ])),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Toggle caption off', [
      cSetHtml('<figure class="image" contenteditable="false"><img src="some.gif"><figcaption contenteditable="true">Caption</figcaption></figure>'),
      cReadFromImage,
      cUpdateModel({
        caption: false
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
        return s.element('div', {
          children: [
            s.element('img', {
              attrs: {
                src: str.is('some.gif')
              }
            })
          ]
        });
      }))
    ])),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Update figure image data', [
      cSetHtml('<figure class="image" contenteditable="false"><img src="some.gif"><figcaption contenteditable="true">Caption</figcaption></figure>'),
      cReadFromImage,
      cUpdateModel({
        src: 'some2.gif'
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
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
            })
          ]
        });
      }))
    ])),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Read/write model to image with style size without change', [
      cSetHtml('<img src="some.gif" style="width: 100px; height: 200px">'),
      cReadFromImage,
      cAssertModel({
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
        borderStyle: ''
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
        return s.element('div', {
          children: [
            s.element('img', {
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
            })
          ]
        });
      }))
    ])),
    Chain.asStep(Element.fromTag('div'), Log.chains('TBA', 'Image: Read/write model to image with style size with size change', [
      cSetHtml('<img src="some.gif" style="width: 100px; height: 200px">'),
      cReadFromImage,
      cAssertModel({
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
        borderStyle: ''
      }),
      cUpdateModel({
        width: '150',
        height: '250'
      }),
      cWriteToImage,
      cAssertStructure(ApproxStructure.build(function (s, str) {
        return s.element('div', {
          children: [
            s.element('img', {
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
            })
          ]
        });
      }))
    ]))
  ], function () {
    success();
  }, failure);
});
