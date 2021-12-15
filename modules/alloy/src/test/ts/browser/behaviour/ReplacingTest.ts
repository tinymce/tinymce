import { ApproxStructure, Assertions, Logger, Step, UiFinder, Chain, Log } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import * as DomFactory from 'ephox/alloy/api/component/DomFactory';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('ReplacingTest', (success, failure) => {

  const memFullReplacing = Memento.record(Container.sketch({
    containerBehaviours: Behaviour.derive([
      Replacing.config({ })
    ]),
    components: [
      Container.sketch({ dom: { tag: 'span' }})
    ]
  }));

  const memPartialReplacing = Memento.record(Container.sketch({
    containerBehaviours: Behaviour.derive([
      Replacing.config({ reuseDom: true })
    ]),
    components: [
      Container.sketch({ dom: { tag: 'label' }})
    ]
  }));

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Replacing.config({ })
      ]),
      components: [
        memFullReplacing.asSpec(),
        memPartialReplacing.asSpec()
      ]
    })
  ), (_doc, _body, _gui, component, _store) => {
    const fullComp = memFullReplacing.get(component);
    const partialComp = memPartialReplacing.get(component);
    const dog = GuiFactory.premade(
      GuiFactory.build({
        uid: 'dog',
        dom: {
          tag: 'div'
        }
      })
    );

    const makeTag = (tag: string, classes: string[] = []): AlloySpec => ({
      dom: {
        tag,
        classes
      },
      components: [ ]
    });

    const sCheckReplaceAt = (label: string, expectedClasses: string[], inputClasses: string[], replaceeIndex: number, replaceClass: string) => Logger.t(
      `${label}: Check replaceAt(${replaceeIndex}, "${replaceClass}") for data: [${inputClasses.join(', ')}]`,
      Step.sync(() => {
        Replacing.set(fullComp,
          Arr.map(inputClasses, (ic) => makeTag('div', [ ic ]))
        );
        Replacing.replaceAt(fullComp, replaceeIndex, Optional.some(makeTag('div', [ replaceClass ])));
        Assertions.assertStructure(
          'Asserting structure',
          ApproxStructure.build((s, _str, arr) => s.element('div', {
            children: Arr.map(expectedClasses, (ec) => s.element('div', { classes: [ arr.has(ec) ] }))
          })),
          fullComp.element
        );
      })
    );

    return [
      Log.stepsAsStep('TBA', 'Replacing', [
        Assertions.sAssertStructure(
          'Initially, has a single span',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('span', { })
            ]
          })),
          fullComp.element
        ),

        Step.sync(() => {
          Replacing.set(fullComp, [

          ]);
        }),

        Assertions.sAssertStructure(
          'After set([]), is empty',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [ ]
          })),
          fullComp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have no contents', [ ], Replacing.contents(fullComp));
        }),

        Step.sync(() => {
          Replacing.set(fullComp, [
            Container.sketch({ uid: 'first' }),
            Container.sketch({ uid: 'second' })
          ]);
        }),

        Assertions.sAssertStructure(
          'After first time of replace([ first, second ])',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('div', { }),
              s.element('div', { })
            ]
          })),
          fullComp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 2 children', 2, Replacing.contents(fullComp).length);
        }),

        Logger.t(
          'Repeating adding the same uids to check clearing is working',
          Step.sync(() => {
            Replacing.set(fullComp, [
              Container.sketch({ uid: 'first' }),
              Container.sketch({ uid: 'second' })
            ]);
          })
        ),
        Assertions.sAssertStructure(
          'After second time of set([ first, second ])',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('div', { }),
              s.element('div', { })
            ]
          })),
          fullComp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 2 children still', 2, Replacing.contents(fullComp).length);
        }),

        Logger.t(
          'Replacing.append to put a new thing at the end.',
          Step.sync(() => {
            Replacing.append(fullComp, Container.sketch({ dom: { tag: 'span' }}));
          })
        ),
        Assertions.sAssertStructure(
          'After append(span)',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('div', { }),
              s.element('div', { }),
              s.element('span', { })
            ]
          })),
          fullComp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 3 children now', 3, Replacing.contents(fullComp).length);
        }),

        Logger.t(
          'Replacing.prepend to put a new thing at the start',
          Step.sync(() => {
            Replacing.prepend(fullComp, Container.sketch({
              dom: {
                tag: 'label'
              }
            }));
          })
        ),

        Assertions.sAssertStructure(
          'After prepend(label)',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('label', {}),
              s.element('div', { }),
              s.element('div', { }),
              s.element('span', { })
            ]
          })),
          fullComp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 4 children now', 4, Replacing.contents(fullComp).length);
        }),

        Logger.t(
          'Replacing.remove to remove the second div',
          Step.sync(() => {
            const second = fullComp.getSystem().getByUid('second').getOrDie();
            Replacing.remove(fullComp, second);
          })
        ),

        Assertions.sAssertStructure(
          'After remove(second)',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('label', {}),
              s.element('div', { }),
              s.element('span', { })
            ]
          })),
          fullComp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 3 children again', 3, Replacing.contents(fullComp).length);
        }),

        Logger.t(
          'Removing should have removed from world, so I should be able to re-add it',
          Step.sync(() => {
            Replacing.append(fullComp, Container.sketch({ uid: 'second' }));
          })
        ),

        Assertions.sAssertStructure(
          'After append(second) after remove(second)',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('label', {}),
              s.element('div', { }),
              s.element('span', { }),
              s.element('div', { })
            ]
          })),
          fullComp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 4 children again', 4, Replacing.contents(fullComp).length);
        }),

        sCheckReplaceAt(
          '.replaceAt 0 of 0 - should do nothing',
          [ ],
          [ ],
          0,
          'replaceAt-0'
        ),

        sCheckReplaceAt(
          '.replaceAt 0 of 1',
          [ 'replaceAt-0' ],
          [ 'original' ],
          0,
          'replaceAt-0'
        ),

        sCheckReplaceAt(
          '.replaceAt 0 of 3',
          [ 'replaceAt-0', 'original2', 'original3' ],
          [ 'original1', 'original2', 'original3' ],
          0,
          'replaceAt-0'
        ),

        sCheckReplaceAt(
          '.replaceAt 2 of 3',
          [ 'original1', 'original2', 'replaceAt-2' ],
          [ 'original1', 'original2', 'original3' ],
          2,
          'replaceAt-2'
        )
      ]),

      Log.stepsAsStep('TINY-8334', 'Partial replacing', [
        Assertions.sAssertStructure(
          'Initially, has a single label',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('label', { })
            ]
          })),
          partialComp.element
        ),

        Chain.asStep(partialComp.element, [
          UiFinder.cFindIn('label'),
          Chain.op((label) => {
            label.dom.magicAttribute = 24;
            Replacing.set(partialComp, [
              { dom: { tag: 'label' }}
            ]);
          }),
          Chain.inject(partialComp.element),
          UiFinder.cFindIn('label'),
          Chain.op((label) => {
            Assertions.assertEq('magic attribute', 24, label.dom.magicAttribute);
          })
        ]),

        Chain.asStep(partialComp.element, [
          Chain.op(() => {
            Replacing.set(partialComp, [
              {
                dom: {
                  tag: 'div'
                },
                components: [
                  { dom: { tag: 'label', classes: [ 'nested-label' ] }},
                  dog
                ]
              }
            ]);
          }),
          UiFinder.cFindIn('.nested-label'),
          Chain.op((label) => {
            label.dom.magicAttribute = 25;
            Replacing.set(partialComp, [
              {
                dom: {
                  tag: 'div'
                },
                components: [
                  { dom: { tag: 'label', classes: [ 'other-label' ] }},
                  dog
                ]
              }
            ]);
          }),
          Chain.inject(partialComp.element),
          UiFinder.cFindIn('.other-label'),
          Chain.op((label) => {
            Assertions.assertEq('Testing that the DOM element has stuck around (and has kept a variable)', 25, label.dom.magicAttribute);
          })
        ]),

        Step.sync(() => {
          Replacing.set(partialComp, [
            {
              dom: DomFactory.fromHtml('<div class="other" />'),
              components: [
                {
                  dom: DomFactory.fromHtml('<span>something else</span>'),
                  components: [
                    {
                      dom: DomFactory.fromHtml('<em data-dog="true">italics</em>')
                    }
                  ]
                }
              ]
            }
          ]);

          Replacing.set(partialComp, [
            {
              dom: DomFactory.fromHtml('<div class="other" />'),
              components: [
                {
                  dom: DomFactory.fromHtml('<span class="fine">something else</span>'),
                  components: [
                    {
                      dom: DomFactory.fromHtml('<em data-dog="true">italics</em>')
                    }
                  ]
                }
              ]
            }
          ]);

          // Now, test a premade
          const premadeA = GuiFactory.build({
            dom: {
              tag: 'div',
              classes: [ 'mover' ]
            }
          });

          Replacing.set(partialComp, [
            {
              dom: {
                tag: 'div',
                classes: [ 'first' ]
              }
            },
            GuiFactory.premade(premadeA)
          ]);

          Assertions.assertStructure(
            'Before moving premade',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                children: [
                  s.element('div', {
                    classes: [ arr.has('first') ]
                  }),
                  s.element('div', {
                    classes: [ arr.has('mover') ]
                  })
                ]
              });
            }),
            partialComp.element
          );

          Replacing.set(partialComp, [
            GuiFactory.premade(premadeA)
          ]);

          Assertions.assertStructure(
            'After moving premade to be the first child',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                children: [
                  s.element('div', {
                    classes: [ arr.has('mover') ]
                  })
                ]
              });
            }),
            partialComp.element
          );
        }),

        Logger.t(
          'Different positions on premade',
          Step.sync(() => {
            const specA = { dom: { tag: 'div', classes: [ 'a' ] }};
            const specB = { dom: { tag: 'span', classes: [ 'b' ] }};

            const premadeB = GuiFactory.premade(GuiFactory.build({
              dom: { tag: 'span', classes: [ 'premade-b' ] }
            }));

            Logger.sync(
              'Checking moving premade',
              () => {
                Replacing.set(partialComp, [
                  specA,
                  premadeB
                ]);

                Assertions.assertStructure(
                  'Initial stage',
                  ApproxStructure.build((s, str, arr) => {
                    return s.element('div', {
                      children: [
                        s.element('div', { classes: [ arr.has('a') ] }),
                        s.element('span', { classes: [ arr.has('premade-b') ] })
                      ]
                    });
                  }),
                  partialComp.element
                );

                Replacing.set(partialComp, [
                  premadeB,
                  specA
                ]);

                Assertions.assertStructure(
                  'Switching premadeB and specA',
                  ApproxStructure.build((s, str, arr) => {
                    return s.element('div', {
                      children: [
                        s.element('span', { classes: [ arr.has('premade-b') ] }),
                        s.element('div', { classes: [ arr.has('a') ] })
                      ]
                    });
                  }),
                  partialComp.element
                );

                Replacing.set(partialComp, [
                  {
                    dom: {
                      tag: 'blockquote',
                    },
                    components: [
                      premadeB
                    ]
                  }
                ]);

                Assertions.assertStructure(
                  'Checking structure blockqoute(premadeB)',
                  ApproxStructure.build((s, str, arr) => {
                    return s.element('div', {
                      children: [
                        s.element('blockquote', {
                          children: [
                            s.element('span', { classes: [ arr.has('premade-b') ] })
                          ]
                        })
                      ]
                    });
                  }),
                  partialComp.element
                );

                Replacing.set(partialComp, [
                  {
                    dom: {
                      tag: 'span',
                    },
                    components: [
                      specB,
                      premadeB,
                      specA
                    ]
                  }
                ]);

                Assertions.assertStructure(
                  'Checking structure span(specB, premadeB, specA)',
                  ApproxStructure.build((s, str, arr) => {
                    return s.element('div', {
                      children: [
                        s.element('span', {
                          children: [
                            s.element('span', { classes: [ arr.has('b') ] }),
                            s.element('span', { classes: [ arr.has('premade-b') ] }),
                            s.element('div', { classes: [ arr.has('a') ] })
                          ]
                        })
                      ]
                    });
                  }),
                  partialComp.element
                );

                Replacing.set(partialComp, [
                  {
                    dom: {
                      tag: 'span',
                    },
                    components: [
                      premadeB,
                      specA
                    ]
                  }
                ]);

                Assertions.assertStructure(
                  'Checking structure span(premadeB, specA)',
                  ApproxStructure.build((s, str, arr) => {
                    return s.element('div', {
                      children: [
                        s.element('span', {
                          children: [
                            s.element('span', { classes: [ arr.has('premade-b') ] }),
                            s.element('div', { classes: [ arr.has('a') ] })
                          ]
                        })
                      ]
                    });
                  }),
                  partialComp.element
                );
              }
            );
          })
        )
      ])
    ];
  }, success, failure);
});
