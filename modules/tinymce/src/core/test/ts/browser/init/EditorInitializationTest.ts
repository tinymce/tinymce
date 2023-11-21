import { ApproxStructure, Assertions } from '@ephox/agar';
import { afterEach, before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, SelectorFilter, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';
import 'tinymce';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.init.EditorInitializationTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  before(() => {
    EditorManager._setBaseUrl('/project/tinymce/js/tinymce');

    let htmlReset = '';
    for (let i = 1; i < 9; i++) {
      const odd = i % 2 !== 0;
      htmlReset += '<textarea id="elm-' + i + '" class="' + (odd ? 'elm-odd' : 'elm-even') + '"></textarea>';
    }
    viewBlock.update(htmlReset);
  });

  afterEach((done) => {
    setTimeout(() => {
      EditorManager.remove();
      done();
    }, 0);
  });

  it('target (initialised properly)', (done) => {
    const elm1 = viewBlock.get().querySelector('#elm-1') as HTMLElement;

    EditorManager.init({
      target: elm1,
      init_instance_callback: (ed) => {
        assert.strictEqual(ed.targetElm, elm1);
        done();
      }
    });
  });

  it('target (initialise on element without id)', (done) => {
    const elm = document.createElement('textarea');
    viewBlock.get().appendChild(elm);

    EditorManager.init({
      target: elm,
      init_instance_callback: (ed) => {
        assert.isAbove(ed.id.length, 0, 'editors id set to: ' + ed.id);
        assert.strictEqual(ed.targetElm, elm);
        done();
      }
    });
  });

  it('target (selector option takes precedence over target option)', (done) => {
    const elm1 = document.getElementById('elm-1') as HTMLElement;
    const elm2 = document.getElementById('elm-2') as HTMLElement;

    EditorManager.init({
      selector: '#elm-2',
      target: elm1,
      init_instance_callback: (ed) => {
        assert.strictEqual(ed.targetElm, elm2);
        done();
      }
    });
  });

  it('selector on non existing targets', () => {
    return EditorManager.init({
      selector: '#non-existing-id',
    }).then((result) => {
      assert.lengthOf(result, 0, 'Should be a result that is zero length');
    });
  });

  it('target (each editor should have a different target)', (done) => {
    const maxCount = document.querySelectorAll('.elm-even').length;
    const elm1 = document.getElementById('elm-1') as HTMLElement;
    let count = 0;
    const targets: HTMLElement[] = [];

    EditorManager.init({
      selector: '.elm-even',
      target: elm1,
      init_instance_callback: (ed) => {
        assert.notStrictEqual(ed.targetElm, elm1, 'target option ignored');
        assert.notInclude(targets, ed.targetElm);

        targets.push(ed.targetElm);

        if (++count >= maxCount) {
          done();
        }
      }
    });
  });

  it('Test base_url and suffix options', (done) => {
    const oldBaseURL = EditorManager.baseURL;
    const oldSuffix = EditorManager.suffix;

    EditorManager.init({
      base_url: '/compiled/fake/url',
      suffix: '.min',
      selector: '#elm-1',
      init_instance_callback: (ed) => {
        assert.equal(EditorManager.suffix, '.min', 'Should have set suffix on EditorManager');
        assert.equal(ed.suffix, '.min', 'Should have set suffix on editor');

        assert.equal(EditorManager.baseURL, EditorManager.documentBaseURL + 'compiled/fake/url', 'Should have set baseURL on EditorManager');

        assert.equal(EditorManager.baseURI.source, EditorManager.documentBaseURL + 'compiled/fake/url', 'Should have set baseURI on EditorManager');
        assert.equal(ed.baseURI.source, EditorManager.documentBaseURL + 'compiled/fake/url', 'Should have set baseURI on editor');

        EditorManager._setBaseUrl(oldBaseURL);
        EditorManager.suffix = oldSuffix;
        done();
      }
    });
  });

  const getSkinCssFilenames = (): string[] => {
    return Arr.bind(SelectorFilter.descendants(SugarElement.fromDom(document), 'link'), (link) => {
      const href = Attribute.get(link, 'href') ?? '';
      const fileName = href.split('/').slice(-1).join('');
      const isSkin = href.indexOf('oxide/') > -1;
      return isSkin ? [ fileName ] : [ ];
    });
  };

  const pCreateInlineModeMultipleInstances = (): Promise<Editor[]> => {
    viewBlock.update('<div class="tinymce-editor"><p>a</p></div><div class="tinymce-editor"><p>b</p></div>');

    return EditorManager.init({
      selector: '.tinymce-editor',
      inline: true,
      promotion: false,
      toolbar_mode: 'wrap'
    });
  };

  const assertEditors = (editors: Editor[]) => {
    Assertions.assertHtml('Editor contents should be the first div content', '<p>a</p>', editors[0].getContent());
    Assertions.assertHtml('Editor contents should be the second div content', '<p>b</p>', editors[1].getContent());
    // eslint-disable-next-line no-console
    console.log('Editor container 0:', editors[0].editorContainer);
    const containerApproxStructure = ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox'), arr.has('tox-tinymce'), arr.has('tox-tinymce-inline') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-editor-container') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-editor-header') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-menubar') ],
                  attrs: {
                    role: str.is('menubar')
                  }
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar') ],
                  attrs: {
                    role: str.is('group')
                  }
                }),
                s.element('div', {
                  classes: [ arr.has('tox-anchorbar') ]
                })
              ]
            })
          ]
        }),
        s.element('div', {
          classes: [ arr.has('tox-throbber') ]
        })
      ]
    }));
    Assertions.assertStructure('Editor container should match expected structure', containerApproxStructure, SugarElement.fromDom(editors[0].editorContainer));
    Assertions.assertStructure('Editor container should match expected structure', containerApproxStructure, SugarElement.fromDom(editors[1].editorContainer));

    assert.deepEqual(
      getSkinCssFilenames(),
      [ 'skin.min.css', 'content.inline.min.css' ],
      'Should only be two skin files the skin and the content for inline mode'
    );

    const targets = Arr.map(editors, (editor) => editor.getElement());
    assert.lengthOf(targets, 2, 'Targets should be two since there are two editors');

    return targets;
  };

  const removeAllEditors = () => EditorManager.remove();

  const assertTargets = (targets: Node[]) => {
    assert.lengthOf(targets, 2, 'Targets should be two since there are two editors');

    Arr.each(targets, (target) => {
      assert.isNotNull(target.parentNode, 'Target parent should not be null');
    });
  };

  const initAndAssertContent = (html: string, selector: string, expectedEditorContent: string, done: () => void) => {
    viewBlock.update(html);

    EditorManager.init({
      selector,
      init_instance_callback: (ed) => {
        assert.equal(ed.getContent({ format: 'text' }), expectedEditorContent, 'Expect editor to have content');
        done();
      }
    });
  };

  it('Initialize multiple inline editors and remove them', async () => {
    const editors = await pCreateInlineModeMultipleInstances();
    const targets = assertEditors(editors);
    removeAllEditors();
    assertTargets(targets);
  });

  it('Initialize on textarea with initial content', (done) => {
    initAndAssertContent('<textarea>Initial Content</textarea>', 'textarea', 'Initial Content', done);
  });

  it('Initialize on input with initial content', (done) => {
    initAndAssertContent('<input value="Initial Content">', 'input', 'Initial Content', done);
  });

  it('Initialize on list item with initial content', (done) => {
    initAndAssertContent('<ul><li>Initial Content</li></ul>', 'li', 'Initial Content', done);
  });

  it('TINY-10305: Should remove ZWNBSP from content when initializing', (done) => {
    initAndAssertContent('<textarea>te\uFEFFst</textarea>', 'textarea', 'test', done);
  });
});
