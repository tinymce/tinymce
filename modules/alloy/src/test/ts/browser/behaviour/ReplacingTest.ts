import { ApproxStructure, Assertions, Logger, Step, UiFinder, Chain, Log } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { Compare, SugarBody } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as DomFactory from 'ephox/alloy/api/component/DomFactory';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('ReplacingTest', (success, failure) => {
  const make = (reuseDom: boolean) => Container.sketch({
    containerBehaviours: Behaviour.derive([
      Replacing.config({ reuseDom })
    ]),
    components: [
      Container.sketch({ dom: { tag: 'span' }})
    ]
  });

  const memWithoutReuse = Memento.record(make(false));
  const memWithReuse = Memento.record(make(true));

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Replacing.config({ })
      ]),
      components: [
        memWithoutReuse.asSpec(),
        memWithReuse.asSpec()
      ]
    })
  ), (_doc, _body, _gui, component, _store) => {
    const withoutReuseComp = memWithoutReuse.get(component);
    const withReuseComp = memWithReuse.get(component);
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

    const sCheckReplaceAtWith = (label: string, comp: AlloyComponent, expectedClasses: string[], inputClasses: string[], replaceeIndex: number, replaceSpec: Optional<AlloySpec>) => Logger.t(
      `${label}: Check replaceAt(${replaceeIndex}, with spec for data: [${inputClasses.join(', ')}]`,
      Step.sync(() => {
        Replacing.set(comp,
          Arr.map(inputClasses, (ic) => makeTag('div', [ ic ]))
        );
        Replacing.replaceAt(comp, replaceeIndex, replaceSpec);
        Assertions.assertStructure(
          'Asserting structure',
          ApproxStructure.build((s, _str, arr) => s.element('div', {
            children: Arr.map(expectedClasses, (ec) => s.element('div', { classes: [ arr.has(ec) ] }))
          })),
          comp.element
        );
      })
    );

    const sCheckReplaceAt = (label: string, comp: AlloyComponent, expectedClasses: string[], inputClasses: string[], replaceeIndex: number, replaceClass: Optional<string>) =>
      sCheckReplaceAtWith(label, comp, expectedClasses, inputClasses, replaceeIndex, replaceClass.map((clazz) => makeTag('div', [ clazz ])));

    return Arr.map([
      { comp: withoutReuseComp, label: 'Without reuse' },
      { comp: withReuseComp, label: 'With reuse' },
    ], (spec) => {
      return Log.stepsAsStep('TBA', spec.label, [
        Assertions.sAssertStructure(
          'Initially, has a single span',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('span', {})
            ]
          })),
          spec.comp.element
        ),

        Step.sync(() => {
          Replacing.set(spec.comp, []);
        }),

        Assertions.sAssertStructure(
          'After set([]), is empty',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: []
          })),
          spec.comp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have no contents', [], Replacing.contents(spec.comp));
        }),

        Step.sync(() => {
          Replacing.set(spec.comp, [
            Container.sketch({ uid: 'first' }),
            Container.sketch({ uid: 'second' })
          ]);
        }),

        Assertions.sAssertStructure(
          'After first time of replace([ first, second ])',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('div', {}),
              s.element('div', {})
            ]
          })),
          spec.comp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 2 children', 2, Replacing.contents(spec.comp).length);
        }),

        Logger.t(
          'Repeating adding the same uids to check clearing is working',
          Step.sync(() => {
            Replacing.set(spec.comp, [
              Container.sketch({ uid: 'first' }),
              Container.sketch({ uid: 'second' })
            ]);
          })
        ),
        Assertions.sAssertStructure(
          'After second time of set([ first, second ])',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('div', {}),
              s.element('div', {})
            ]
          })),
          spec.comp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 2 children still', 2, Replacing.contents(spec.comp).length);
        }),

        Logger.t(
          'Replacing.append to put a new thing at the end.',
          Step.sync(() => {
            Replacing.append(spec.comp, Container.sketch({ dom: { tag: 'span' }}));
          })
        ),
        Assertions.sAssertStructure(
          'After append(span)',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('div', {}),
              s.element('div', {}),
              s.element('span', {})
            ]
          })),
          spec.comp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 3 children now', 3, Replacing.contents(spec.comp).length);
        }),

        Logger.t(
          'Replacing.prepend to put a new thing at the start',
          Step.sync(() => {
            Replacing.prepend(spec.comp, Container.sketch({
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
              s.element('div', {}),
              s.element('div', {}),
              s.element('span', {})
            ]
          })),
          spec.comp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 4 children now', 4, Replacing.contents(spec.comp).length);
        }),

        Logger.t(
          'Replacing.remove to remove the second div',
          Step.sync(() => {
            const second = spec.comp.getSystem().getByUid('second').getOrDie();
            Replacing.remove(spec.comp, second);
          })
        ),

        Assertions.sAssertStructure(
          'After remove(second)',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('label', {}),
              s.element('div', {}),
              s.element('span', {})
            ]
          })),
          spec.comp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 3 children again', 3, Replacing.contents(spec.comp).length);
        }),

        Logger.t(
          'Removing should have removed from world, so I should be able to re-add it',
          Step.sync(() => {
            Replacing.append(spec.comp, Container.sketch({ uid: 'second' }));
          })
        ),

        Assertions.sAssertStructure(
          'After append(second) after remove(second)',
          ApproxStructure.build((s, _str, _arr) => s.element('div', {
            children: [
              s.element('label', {}),
              s.element('div', {}),
              s.element('span', {}),
              s.element('div', {})
            ]
          })),
          spec.comp.element
        ),
        Step.sync(() => {
          Assert.eq('Should have 4 children again', 4, Replacing.contents(spec.comp).length);
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
                Replacing.set(spec.comp, [
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
                  spec.comp.element
                );

                Replacing.set(spec.comp, [
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
                  spec.comp.element
                );

                Replacing.set(spec.comp, [
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
                  spec.comp.element
                );

                Replacing.set(spec.comp, [
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
                  spec.comp.element
                );

                Replacing.set(spec.comp, [
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
                  spec.comp.element
                );
              }
            );
          })
        ),

        sCheckReplaceAt(
          '.replaceAt 0 of 0 - should do nothing',
          spec.comp,
          [],
          [],
          0,
          Optional.some('replaceAt-0')
        ),

        sCheckReplaceAt(
          '.replaceAt 0 of 1',
          spec.comp,
          [ 'replaceAt-0' ],
          [ 'original' ],
          0,
          Optional.some('replaceAt-0')
        ),

        sCheckReplaceAt(
          '.replaceAt 0 of 3',
          spec.comp,
          [ 'replaceAt-0', 'original2', 'original3' ],
          [ 'original1', 'original2', 'original3' ],
          0,
          Optional.some('replaceAt-0')
        ),

        sCheckReplaceAt(
          '.replaceAt 2 of 3',
          spec.comp,
          [ 'original1', 'original2', 'replaceAt-2' ],
          [ 'original1', 'original2', 'original3' ],
          2,
          Optional.some('replaceAt-2')
        ),

        sCheckReplaceAt(
          '.replaceAt 1 of 3 with nothing',
          spec.comp,
          [ 'original1', 'original3' ],
          [ 'original1', 'original2', 'original3' ],
          1,
          Optional.none()
        ),

        sCheckReplaceAtWith(
          '.replaceAt 2 of 3 with premade spec',
          spec.comp,
          [ 'original1', 'original2', 'replaceAt-2' ],
          [ 'original1', 'original2', 'original3' ],
          2,
          Optional.some(GuiFactory.premade(GuiFactory.build(makeTag('div', [ 'replaceAt-2' ]))))
        )
      ]);
    }).concat([
      Step.sync(() => {
        Replacing.set(withReuseComp, [
          { dom: { tag: 'label' }}
        ]);
      }),

      Chain.asStep(withReuseComp.element, [
        UiFinder.cFindIn('label'),
        Chain.op((label) => {
          label.dom.magicAttribute = 24;
          Replacing.set(withReuseComp, [
            { dom: { tag: 'label' }}
          ]);
        }),
        Chain.inject(withReuseComp.element),
        UiFinder.cFindIn('label'),
        Chain.op((label) => {
          Assert.eq('magic attribute', 24, label.dom.magicAttribute);
        })
      ]),

      Chain.asStep(withReuseComp.element, [
        Chain.op(() => {
          Replacing.set(withReuseComp, [
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
          Replacing.set(withReuseComp, [
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
        Chain.inject(withReuseComp.element),
        UiFinder.cFindIn('.other-label'),
        Chain.op((label) => {
          Assert.eq('Testing that the DOM element has stuck around (and has kept a variable)', 25, label.dom.magicAttribute);
        })
      ]),

      Step.sync(() => {
        Replacing.set(withReuseComp, [
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
        const beforeLastChild = UiFinder.findIn(SugarBody.body(), 'em[data-dog]').getOrDie();

        // Replace while only changing the class of the middle component
        Replacing.set(withReuseComp, [
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

        const afterLastChild = UiFinder.findIn(SugarBody.body(), 'em[data-dog]').getOrDie();
        Assert.eq('The DOM elements should not have been re-rendered', beforeLastChild.dom, afterLastChild.dom);
      }),

      // Now, test a premade
      Step.sync(() => {
        const premadeA = GuiFactory.build({
          dom: {
            tag: 'div',
            classes: [ 'mover' ]
          }
        });

        Replacing.set(withReuseComp, [
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
          withReuseComp.element
        );

        Replacing.set(withReuseComp, [
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
          withReuseComp.element
        );
      }),

      Step.sync(() => {
        Replacing.set(withReuseComp, [
          {
            dom: {
              tag: 'div',
              innerHtml: '<p>Paragraph</p>'
            },
            components: [
              {
                dom: { tag: 'span', classes: [ 'foo' ] }
              }
            ]
          }
        ]);

        const beforeSpan = UiFinder.findIn(SugarBody.body(), 'span.foo').getOrDie();
        Replacing.set(withReuseComp, [
          {
            dom: {
              tag: 'div',
              innerHtml: '<p>Paragraph</p>'
            },
            components: [
              {
                dom: { tag: 'span', classes: [ 'bar' ] }
              }
            ]
          }
        ]);

        const afterSpan = UiFinder.findIn(SugarBody.body(), 'span.bar').getOrDie();
        Assertions.assertStructure(
          'Replacing with mixed children',
          ApproxStructure.build((s, str, arr) =>
            s.element('div', {
              children: [
                s.element('div', {
                  children: [
                    s.element('p', {}),
                    s.element('span', { classes: [ arr.has('bar') ] }),
                  ]
                })
              ]
            })
          ),
          withReuseComp.element
        );

        Assert.eq('Span elements were re-rendered as mixed children cannot be patched', false, Compare.eq(afterSpan, beforeSpan));
      })
    ]);
  }, success, failure);
});
