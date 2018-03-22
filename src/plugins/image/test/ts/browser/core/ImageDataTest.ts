import { Chain, Logger, Pipeline, Assertions, ApproxStructure, RawAssertions } from '@ephox/agar';
import { Element, Html, SelectorFind } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';
import { read, write } from 'tinymce/plugins/image/core/ImageData';
import { Merger } from '@ephox/katamari';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';

UnitTest.asynctest('browser.tinymce.plugins.image.core.ImageDataTest', (success, failure) => {
  const cSetHtml = (html) => {
    return Chain.op(function (elm) {
      Html.set(elm, html);
    });
  };

  const normalizeCss = (css: string) => {
    return DOMUtils.DOM.styles.serialize(DOMUtils.DOM.styles.parse(css));
  };

  const cReadFromImage = Chain.mapper(function (elm) {
    const img = SelectorFind.descendant(elm, 'img').getOrDie('failed to find image');
    return { model: read(normalizeCss, img.dom()), image: img, parent: elm };
  });

  const cWriteToImage = Chain.op(function (data) {
    write(normalizeCss, data.model, data.image.dom());
  });

  const cUpdateModel = (props) => {
    return Chain.mapper(function (data) {
      return { model: Merger.merge(data.model, props), image: data.image, parent: data.parent };
    });
  };

  const cAssertModel = (model) => {
    return Chain.op(function (data) {
      RawAssertions.assertEq('', model, data.model);
    });
  };

  const cAssertStructure = (structure) => {
    return Chain.op(function (data) {
      Assertions.assertStructure('', structure, data.parent);
    });
  };

  Pipeline.async({}, [
    Logger.t('Read/write model to simple image without change', Chain.asStep(Element.fromTag('div'), [
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
        borderWidth: '',
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
    Logger.t('Read/write model to complex image without change', Chain.asStep(Element.fromTag('div'), [
      cSetHtml('<img src="some.gif" class="class" width="100" height="200" style="margin: 1px 2px; border: 1px solid red" alt="alt" title="title">'),
      cReadFromImage,
      cAssertModel({
        src: 'some.gif',
        alt: 'alt',
        title: 'title',
        width: '100',
        height: '200',
        class: 'class',
        style: 'margin: 1px 2px; border: 1px solid red;',
        caption: false,
        hspace: '2',
        vspace: '1',
        borderWidth: '1',
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
    Logger.t('Read/write model to simple image with changes', Chain.asStep(Element.fromTag('div'), [
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
        borderWidth: '3',
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
    Logger.t('Read/write model to complex image with changes', Chain.asStep(Element.fromTag('div'), [
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
        borderWidth: '4',
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
    Logger.t('Toggle caption on', Chain.asStep(Element.fromTag('div'), [
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
    Logger.t('Toggle caption off', Chain.asStep(Element.fromTag('div'), [
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
    Logger.t('Update figure image data', Chain.asStep(Element.fromTag('div'), [
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
    ]))
  ], function () {
    success();
  }, failure);
});
