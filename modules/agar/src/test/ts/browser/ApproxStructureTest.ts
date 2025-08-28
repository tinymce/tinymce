import { Assert, describe, it } from '@ephox/bedrock-client';
import { InsertAll, SugarElement } from '@ephox/sugar';

import * as ApproxStructure from 'ephox/agar/api/ApproxStructure';
import * as Assertions from 'ephox/agar/api/Assertions';
import { StructAssert } from 'ephox/agar/assertions/ApproxStructures';

describe('browser.agar.ApproxStructureTest', () => {
  const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block;">' +
    '<div selected="true">' +
    '<span data-ephox-id="blah" class="disabled">span</span>' +
    '</div>' +
    'words' +
    '<span></span>' +
    '</div>';

  const check = (expected: StructAssert, input: string) => {
    const target = SugarElement.fromHtml(input);
    Assertions.assertStructure('Test', expected, target);
  };

  const checkThrowError = (expected: StructAssert, input: string) => {
    const target = SugarElement.fromHtml(input);
    Assert.throwsError('Test', () => Assertions.assertStructure('Test', expected, target));
  };

  it('TINY-9102: ApproxStructure build', () => {
    check(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'car': str.none('no car attribute'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.not('dog'),
          arr.hasPrefix('tes')
        ],
        styles: {
          display: str.is('block')
        },
        children: [
          s.element('div', {
            attrs: {
              selected: str.is('true')
            },
            children: [
              s.element('span', {
                attrs: {
                  'data-ephox-id': str.startsWith('bl')
                },
                classes: [
                  arr.not('enabled'),
                  arr.has('disabled')
                ],
                html: str.is('span')
              })
            ]
          }),
          s.text(
            str.is('words')
          ),
          s.anything()
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure fromHtml', () => {
    check(ApproxStructure.fromHtml(html), html);
  });

  it('TINY-9102: ApproxStructure theRest', () => {
    check(ApproxStructure.build((s, str, _arr) =>
      s.element('div', {
        children: [
          s.element('div', {
            attrs: {
              selected: str.is('true')
            }
          }),
          s.theRest()
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure either', () => {
    const struct1 = ApproxStructure.build((s, str, arr) =>
      s.either([
        s.element('span', {
          classes: [
            arr.has('hello'),
            arr.not('fizzbuzz')
          ]
        }),
        s.element('div', {
          classes: [
            arr.has('fizzbuzz'),
            arr.not('hello')
          ]
        })
      ]));

    check(struct1, '<span class="hello"></span>');
    check(struct1, '<div class="fizzbuzz"></span>');
  });

  it('TINY-9102: ApproxStructure oneOrMore and zeroOrOne', () => {
    const struct2 = ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        children: [
          s.oneOrMore(s.element('span', {
            classes: [
              arr.has('hello')
            ]
          })),
          s.element('div', {}),
          s.zeroOrOne(s.element('span', {
            classes: [
              arr.has('bye')
            ]
          }))
        ]
      }));

    check(struct2, '<div><span class="hello"></span><div></div></div>');
    check(struct2, '<div><span class="hello"></span><div></div><span class="bye"></span></div>');
    check(struct2, '<div><span class="hello"></span><span class="hello"></span><span class="hello"></span><span class="hello"></span><div></div><span class="bye"></span></div>');
  });

  it('TINY-9102: ApproxStructure text combineSiblings', () => {
    const container = SugarElement.fromTag('div');
    InsertAll.append(container, [
      SugarElement.fromText('hello'),
      SugarElement.fromText(' '),
      SugarElement.fromText('world')
    ]);

    Assertions.assertStructure('Test', ApproxStructure.build((s, str, _arr) =>
      s.element('div', {
        children: [
          s.text(str.is('hello world'), true)
        ]
      })), container);

    Assertions.assertStructure('Test', ApproxStructure.build((s, str, _arr) =>
      s.element('div', {
        children: [
          s.text(str.is('hello'), false),
          s.text(str.is(' world'), true)
        ]
      })), container);
  });

  it('TINY-9102: ApproxStructure build mix and match', () => {
    check(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        exactClasses: [
          'test1', 'root'
        ],
        exactStyles: {
          display: str.is('block')
        },
        children: [
          s.element('div', {
            exactAttrs: {
              selected: str.is('true')
            },
            children: [
              s.element('span', {
                attrs: {
                  'data-ephox-id': str.startsWith('bl')
                },
                classes: [ arr.has('disabled') ],
                html: str.is('span')
              })
            ]
          }),
          s.text(
            str.is('words')
          ),
          s.anything()
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are extra attributes', () => {
    const html = '<div extra-attribute2="extra2" extra-attribute="extra" data-key="test-1" selected="double" class="test1 root" style="display: block;">' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        exactAttrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test'),
          'extra-attribute': str.startsWith('ex'),
          'non-existent-attribute': str.is('non'),
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        styles: {
          display: str.is('block')
        },
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are extra classes', () => {
    const html = '<div data-key="test-1" selected="double" class="extra-class test1 root" style="display: block;">' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, _arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        exactClasses: [
          'test1', 'root', 'non-existent-class'
        ],
        styles: {
          display: str.is('block')
        },
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are extra styles', () => {
    const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block; width: 20px;">' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        exactStyles: {
          display: str.is('block'),
          height: str.is('20px')
        },
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are fewer attributes', () => {
    const html = '<div extra-attribute2="extra2" extra-attribute="extra" data-key="test-1" selected="double" class="test1 root" style="display: block;">' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        exactAttrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test'),
          'extra-attribute': str.startsWith('ex'),
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        styles: {
          display: str.is('block')
        },
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are fewer classes', () => {
    const html = '<div data-key="test-1" selected="double" class="extra-class test1 root" style="display: block;">' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, _arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        exactClasses: [
          'test1'
        ],
        styles: {
          display: str.is('block')
        },
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are fewer styles', () => {
    const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block; width: 20px;">' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        exactStyles: {
          display: str.is('block'),
        },
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are extra attributes (children)', () => {
    const html = '<div extra-attribute2="extra2" extra-attribute="extra" data-key="test-1" selected="double" class="test1 root" style="display: block;">' +
      '<div selected="true" attr="hello">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test'),
          'extra-attribute': str.startsWith('ex'),
          'extra-attribute2': str.is('extra2'),
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        styles: {
          display: str.is('block')
        },
        children: [
          s.element('div', {
            exactAttrs: {
              'selected': str.is('true'),
              'attr': str.is('hello'),
              'extra-attribute': str.is('extra')
            },
          })
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are extra classes (children)', () => {
    const html = '<div data-key="test-1" selected="double" class="extra-class test1 root" style="display: block;">' +
      '<div selected="true" classes="hello there">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.has('root'),
          arr.has('extra-class')
        ],
        styles: {
          display: str.is('block')
        },
        children: [
          s.element('div', {
            attrs: {
              selected: str.is('true')
            },
            exactClasses: [
              'hello', 'there', '1'
            ]
          })
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are extra styles (children)', () => {
    const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block; width: 20px;">' +
      '<div selected="true" style="display: block">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        styles: {
          display: str.is('block'),
          width: str.is('20px')
        },
        children: [
          s.element('div', {
            attrs: {
              selected: str.is('true')
            },
            exactStyles: {
              display: str.is('block'),
              width: str.is('20px')
            }
          })
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are fewer attributes (children)', () => {
    const html = '<div extra-attribute2="extra2" extra-attribute="extra" data-key="test-1" selected="double" class="test1 root" style="display: block;">' +
      '<div selected="true" attr="hello">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test'),
          'extra-attribute': str.startsWith('ex'),
          'extra-attribute2': str.is('extra2'),
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        styles: {
          display: str.is('block')
        },
        children: [
          s.element('div', {
            exactAttrs: {
              selected: str.is('true')
            },
          })
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are fewer classes (children)', () => {
    const html = '<div data-key="test-1" selected="double" class="extra-class test1 root" style="display: block;">' +
      '<div selected="true" classes="hello there">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.has('root'),
          arr.has('extra-class')
        ],
        styles: {
          display: str.is('block')
        },
        children: [
          s.element('div', {
            exactAttrs: {
              selected: str.is('true')
            },
            exactClasses: [
              'hello'
            ]
          })
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure throws error when there are fewer styles (children)', () => {
    const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block; width: 20px;">' +
      '<div selected="true" style="display: block; width: 20px;">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        styles: {
          display: str.is('block'),
          width: str.is('20px')
        },
        children: [
          s.element('div', {
            exactAttrs: {
              selected: str.is('true')
            },
            exactStyles: {
              display: str.is('block'),
            }
          })
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure should use exact attrs when the exact and non exact attrs are specified', () => {
    const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block; width: 20px;">' +
      '<div selected="true" style="display: block; width: 20px;">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        exactAttrs: {
          selected: str.is('double')
        },
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        styles: {
          display: str.is('block'),
          width: str.is('20px')
        },
        children: [
          s.element('div', {
            attrs: {
              selected: str.is('true')
            },
            styles: {
              display: str.is('block'),
            }
          })
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure should use exact classes when the exact and non exact classes are specified', () => {
    const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block; width: 20px;">' +
      '<div selected="true" style="display: block; width: 20px;">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        exactClasses: [
          'test1'
        ],
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        styles: {
          display: str.is('block'),
          width: str.is('20px')
        },
        children: [
          s.element('div', {
            attrs: {
              selected: str.is('true')
            },
            styles: {
              display: str.is('block'),
            }
          })
        ]
      })), html);
  });

  it('TINY-9102: ApproxStructure should use exact styles when the exact and non exact styles are specified', () => {
    const html = '<div data-key="test-1" selected="double" class="test1 root" style="display: block; width: 20px;">' +
      '<div selected="true" style="display: block; width: 20px;">' +
      '</div>' +
      '</div>';

    checkThrowError(ApproxStructure.build((s, str, arr) =>
      s.element('div', {
        attrs: {
          'selected': str.is('double'),
          'data-key': str.contains('test')
        },
        classes: [
          arr.has('test1'),
          arr.has('root')
        ],
        exactStyles: {
          display: str.is('block'),
        },
        styles: {
          display: str.is('block'),
          width: str.is('20px')
        },
        children: [
          s.element('div', {
            attrs: {
              selected: str.is('true')
            },
            styles: {
              display: str.is('block'),
            }
          })
        ]
      })), html);
  });
});
