import { ApproxStructure, Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as Render from 'ephox/snooker/operate/Render';

UnitTest.asynctest('RenderTest', (success, failure) => {
  Pipeline.async({}, [
    Logger.t('Render table default options', Step.sync(() => {
      const table = Render.render(1, 2, 0, 0, 'cells');

      Assertions.assertStructure('Should be a table with default styles/attributes', ApproxStructure.build((s, str, _arr) => s.element('table', {
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
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('td', {
                    children: [
                      s.element('br', {})
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })), table);
    })),
    Logger.t('Render table with everything disabled and with styles and without colgroup', Step.sync(() => {
      const table = Render.render(1, 2, 0, 0, 'cells', { styles: { width: '50%', height: '100px' }, attributes: {}, colGroups: false });

      Assertions.assertStructure('Should be a table with styles', ApproxStructure.build((s, str, _arr) => s.element('table', {
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
      })), table);
    })),
    Logger.t('Render table with everything disabled and with styles and with colgroup', Step.sync(() => {
      const table = Render.render(1, 2, 0, 0, 'cells', { styles: { width: '50%', height: '100px' }, attributes: {}, colGroups: true });

      Assertions.assertStructure('Should be a table with styles', ApproxStructure.build((s, str, _arr) => s.element('table', {
        styles: {
          width: str.is('50%'),
          height: str.is('100px')
        },
        children: [
          s.element('colgroup', {
            children: [
              s.element('col', {
                styles: {
                  width: str.none('Should not have width')
                }
              }),
              s.element('col', {
                styles: {
                  width: str.none('Should not have width')
                }
              })
            ]
          }),
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
      })), table);
    })),
    Logger.t('Render table with attributes with colgroups', Step.sync(() => {
      const table = Render.render(1, 2, 0, 0, 'cells', { styles: {}, attributes: { border: '1', class: 'myclass' }, colGroups: true });

      Assertions.assertStructure('Should be a table with styles', ApproxStructure.build((s, str, _arr) => s.element('table', {
        styles: {
          'width': str.none('Should not have width'),
          'border-collapse': str.none('Should not have border-collapse')
        },
        attrs: {
          border: str.is('1'),
          class: str.is('myclass')
        },
        children: [
          s.element('colgroup', {
            children: [
              s.element('col', {
                styles: {
                  width: str.none('Should not have width')
                }
              }),
              s.element('col', {
                styles: {
                  width: str.none('Should not have width')
                }
              })
            ]
          }),
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
      })), table);
    })),
    Logger.t('Render table with attributes without colgroups', Step.sync(() => {
      const table = Render.render(1, 2, 0, 0, 'cells', { styles: {}, attributes: { border: '1', class: 'myclass' }, colGroups: false });

      Assertions.assertStructure('Should be a table with styles', ApproxStructure.build((s, str, _arr) => s.element('table', {
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
      })), table);
    })),
    Logger.t('Render table with everything disabled with colgroup', Step.sync(() => {
      const table = Render.render(1, 2, 0, 0, 'cells', { styles: {}, attributes: {}, colGroups: true });

      Assertions.assertStructure('Should be a table with default styles/attributes', ApproxStructure.build((s, str, _arr) => s.element('table', {
        styles: {
          'width': str.none('Should not have width'),
          'border-collapse': str.none('Should not have border-collapse')
        },
        children: [
          s.element('colgroup', {
            children: [
              s.element('col', {
                styles: {
                  width: str.none('Should not have width')
                }
              }),
              s.element('col', {
                styles: {
                  width: str.none('Should not have width')
                }
              })
            ]
          }),
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
      })), table);
    })),
    Logger.t('Render table with everything disabled without colgroup', Step.sync(() => {
      const table = Render.render(1, 2, 0, 0, 'cells', { styles: {}, attributes: {}, colGroups: false });

      Assertions.assertStructure('Should be a table with default styles/attributes', ApproxStructure.build((s, str, _arr) => s.element('table', {
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
      })), table);
    })),
    Logger.t('Render table with cells header', Step.sync(() => {
      const table = Render.render(2, 3, 1, 2, 'cells');

      Assertions.assertStructure('Should be a table with a header row of ths', ApproxStructure.build((s, _str, _arr) => s.element('table', {
        children: [
          s.element('tbody', {
            children: [
              s.element('tr', {
                children: [
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  })
                ]
              }),
              s.element('tr', {
                children: [
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('td', {
                    children: [
                      s.element('br', {})
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })), table);
    })),
    Logger.t('Render table with section header', Step.sync(() => {
      const table = Render.render(2, 3, 1, 2, 'section');

      Assertions.assertStructure('Should be a table with a header row of ths', ApproxStructure.build((s, _str, _arr) => s.element('table', {
        children: [
          s.element('thead', {
            children: [
              s.element('tr', {
                children: [
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('td', {
                    children: [
                      s.element('br', {})
                    ]
                  })
                ]
              })
            ]
          }),
          s.element('tbody', {
            children: [
              s.element('tr', {
                children: [
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('td', {
                    children: [
                      s.element('br', {})
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })), table);
    })),
    Logger.t('Render table with sectionCells header', Step.sync(() => {
      const table = Render.render(2, 3, 1, 2, 'sectionCells');

      Assertions.assertStructure('Should be a table with a header row of ths', ApproxStructure.build((s, _str, _arr) => s.element('table', {
        children: [
          s.element('thead', {
            children: [
              s.element('tr', {
                children: [
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  })
                ]
              })
            ]
          }),
          s.element('tbody', {
            children: [
              s.element('tr', {
                children: [
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('th', {
                    children: [
                      s.element('br', {})
                    ]
                  }),
                  s.element('td', {
                    children: [
                      s.element('br', {})
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })), table);
    }))
  ], success, failure);
});
