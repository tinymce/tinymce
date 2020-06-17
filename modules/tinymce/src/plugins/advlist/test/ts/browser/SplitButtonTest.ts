import { ApproxStructure, Assertions, Keyboard, Keys, Log, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.advlist.SplitButtonTest', function (success, failure) {
  AdvListPlugin();
  ListsPlugin();
  Theme();

  const clickOnSplitBtnFor = (label) => Log.stepsAsStep('TBA', `ADVlist: Test split menu for ${label} has the correct Dom structure`, [
    Mouse.sClickOn(Body.body(), '[aria-label="' + label + '"] > .tox-tbtn + .tox-split-button__chevron'),
    Waiter.sTryUntil(
      `Waiting for ${label} menu to appear`,
      UiFinder.sExists(Body.body(), '.tox-menu.tox-selected-menu')
    )
  ]);

  const assertNumListStructure = () => Step.sync(() => {
    Assertions.assertStructure('A basic alert dialog should have these components',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tiered-menu') ],
        children: [
          s.element('div', {
            classes: [
              arr.has('tox-menu'),
              arr.has('tox-collection'),
              arr.has('tox-collection--toolbar'),
              arr.has('tox-collection--toolbar-lg'),
              arr.has('tox-selected-menu')
            ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: [
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item'),
                      arr.has('tox-collection__item--active')
                    ],
                    attrs: {
                      title: str.is('Default')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      title: str.is('Circle')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      title: str.is('Square')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      Element.fromDom(document.querySelector('.tox-tiered-menu'))
    );
  });

  const assertBullListStructure = () => Step.sync(() => {
    Assertions.assertStructure('A basic alert dialog should have these components',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tiered-menu') ],
        children: [
          s.element('div', {
            classes: [
              arr.has('tox-menu'),
              arr.has('tox-collection'),
              arr.has('tox-collection--toolbar'),
              arr.has('tox-collection--toolbar-lg'),
              arr.has('tox-selected-menu')
            ],
            children: [
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: [
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item'),
                      arr.has('tox-collection__item--active')
                    ],
                    attrs: {
                      title: str.is('Default')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      title: str.is('Lower Alpha')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      title: str.is('Lower Greek')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  })
                ]
              }),
              // second row of icons
              s.element('div', {
                classes: [ arr.has('tox-collection__group') ],
                children: [
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      title: str.is('Lower Roman')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      title: str.is('Upper Alpha')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  }),
                  s.element('div', {
                    classes: [
                      arr.has('tox-menu-nav__js'),
                      arr.has('tox-collection__item')
                    ],
                    attrs: {
                      title: str.is('Upper Roman')
                    },
                    children: [
                      s.element('div', {
                        classes: [ arr.has('tox-collection__item-icon') ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })),
      Element.fromDom(document.querySelector('.tox-tiered-menu'))
    );
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [

      clickOnSplitBtnFor('Numbered list'),
      assertNumListStructure(),
      Keyboard.sKeydown(Element.fromDom(document), Keys.escape(), { }),
      clickOnSplitBtnFor('Bullet list'),
      assertBullListStructure()

    ], onSuccess, onFailure);
  }, {
    plugins: 'advlist lists',
    advlist_bullet_styles: 'default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman',
    advlist_number_styles: 'default,circle,square',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
