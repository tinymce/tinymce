import { ApproxStructure, Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import * as Render from 'ephox/snooker/operate/Render';

UnitTest.asynctest('RenderTest', (success, failure) => {
    Pipeline.async({}, [
      Logger.t('Render table default options', Step.sync(() => {
        const table = Render.render(1, 2, 0, 0);

        Assertions.assertStructure('Should be a table with default styles/attributes', ApproxStructure.build((s, str, arr) => {
          return s.element('table', {
            styles: {
              'width': str.is('100%'),
              'border-collapse': str.is('collapse')
            },
            children: [
              s.element('tbody', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        styles: {
                          width: str.is('50%')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      }),
                      s.element('td', {
                        styles: {
                          width: str.is('50%')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          });
        }), table);
      })),
      Logger.t('Render table with percentages', Step.sync(() => {
        const table = Render.render(1, 2, 0, 0, { styles: {}, attributes: {}, percentages: true });

        Assertions.assertStructure('Should be a table with percentages', ApproxStructure.build((s, str, arr) => {
          return s.element('table', {
            styles: {
              'width': str.none('Should not have width'),
              'border-collapse': str.none('Should not have border-collapse')
            },
            children: [
              s.element('tbody', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        styles: {
                          width: str.is('50%')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      }),
                      s.element('td', {
                        styles: {
                          width: str.is('50%')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          });
        }), table);
      })),
      Logger.t('Render table with everything disabled', Step.sync(() => {
        const table = Render.render(1, 2, 0, 0, { styles: { width: '50%', height: '100px' }, attributes: {}, percentages: false });

        Assertions.assertStructure('Should be a table with styles', ApproxStructure.build((s, str, arr) => {
          return s.element('table', {
            styles: {
              width: str.is('50%'),
              height: str.is('100px')
            },
            children: [
              s.element('tbody', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        styles: {
                          width: str.none('Should not have width')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      }),
                      s.element('td', {
                        styles: {
                          width: str.none('Should not have width')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          });
        }), table);
      })),
      Logger.t('Render table with attributes', Step.sync(() => {
        const table = Render.render(1, 2, 0, 0, { styles: {}, attributes: { border: '1', class: 'myclass' }, percentages: false });

        Assertions.assertStructure('Should be a table with styles', ApproxStructure.build((s, str, arr) => {
          return s.element('table', {
            styles: {
              'width': str.none('Should not have width'),
              'border-collapse': str.none('Should not have border-collapse')
            },
            attrs: {
              border: str.is('1'),
              class: str.is('myclass')
            },
            children: [
              s.element('tbody', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        styles: {
                          width: str.none('Should not have width')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      }),
                      s.element('td', {
                        styles: {
                          width: str.none('Should not have width')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          });
        }), table);
      })),
      Logger.t('Render table with everything disabled', Step.sync(() => {
        const table = Render.render(1, 2, 0, 0, { styles: {}, attributes: {}, percentages: false });

        Assertions.assertStructure('Should be a table with default styles/attributes', ApproxStructure.build((s, str, arr) => {
          return s.element('table', {
            styles: {
              'width': str.none('Should not have width'),
              'border-collapse': str.none('Should not have border-collapse')
            },
            children: [
              s.element('tbody', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        styles: {
                          width: str.none('Should not have width')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      }),
                      s.element('td', {
                        styles: {
                          width: str.none('Should not have width')
                        },
                        children: [
                          s.element('br', {})
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          });
        }), table);
      }))
    ], success, failure);
});
