import { context, describe, it } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { WordCountApi } from 'tinymce/plugins/wordcount/api/Api';
import Plugin from 'tinymce/plugins/wordcount/Plugin';

interface Sel {
  readonly startPath: number[];
  readonly soffset: number;
  readonly finishPath: number[];
  readonly foffset: number;
}

describe('browser.tinymce.plugins.wordcount.ApiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'wordcount',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const createTest = (getCount: (api: WordCountApi) => number) => (content: string, expectedLength: number, sel?: Sel) => () => {
    const editor = hook.editor();
    const api: WordCountApi = editor.plugins.wordcount as WordCountApi;
    editor.setContent(content);
    if (Type.isNonNullable(sel)) {
      TinySelections.setSelection(editor, sel.startPath, sel.soffset, sel.finishPath, sel.foffset);
    }
    assert.equal(getCount(api), expectedLength);
  };

  const bodyWordCount = createTest((api) => api.body.getWordCount());
  const bodyCharacterCount = createTest((api) => api.body.getCharacterCount());
  const bodyCharacterCountWithoutSpaces = createTest((api) => api.body.getCharacterCountWithoutSpaces());

  const selectionWordCount = createTest((api) => api.selection.getWordCount());
  const selectionCharacterCount = createTest((api) => api.selection.getCharacterCount());
  const selectionCharacterCountWithoutSpaces = createTest((api) => api.selection.getCharacterCountWithoutSpaces());

  context('Body word count', () => {
    it('Simple word count', bodyWordCount('<p>My sentence is this.</p>', 4));
    it('Does not count dashes', bodyWordCount('<p>Something -- ok</p>', 2));
    it('Does not count asterisks, non-word characters', bodyWordCount('<p>* something\n\u00b7 something else</p>', 3));
    it('Does count numbers', bodyWordCount('<p>Something 123 ok</p>', 3));
    it('Does not count htmlentities', bodyWordCount(`<p>It&rsquo;s my life &ndash; &#8211; &#x2013; don't you forget.</p>`, 6));
    it('Counts hyphenated words as one word', bodyWordCount('<p>Hello some-word here.</p>', 3));
    it('Counts words between blocks as two words', bodyWordCount('<p>Hello</p><p>world</p>', 2));
  });

  context('Body character count', () => {
    it('Simple character count', bodyCharacterCount('<p>My sentence is this.</p>', 20));
    it('Does not count newline', bodyCharacterCount('<p>a<br>b</p>', 2));
    it('Counts surrogate pairs as single character', bodyCharacterCount('<p>𩸽</p>', 1));
  });

  context('Body character count without spaces', () => {
    it('Simple character count', bodyCharacterCountWithoutSpaces('<p>My sentence is this.</p>', 17));
    it('Counts surrogate pairs as single character', bodyCharacterCountWithoutSpaces('<p>𩸽</p>', 1));
  });

  context('Selection word count', () => {
    it('Simple word count', selectionWordCount('<p>My sentence is this.</p>', 2, {
      startPath: [ 0, 0 ],
      soffset: 2,
      finishPath: [ 0, 0 ],
      foffset: 15
    }));
  });

  context('Selection character count', () => {
    it('Simple word count', selectionCharacterCount('<p>My sentence is this.</p>', 13, {
      startPath: [ 0, 0 ],
      soffset: 2,
      finishPath: [ 0, 0 ],
      foffset: 15
    }));
  });

  context('Selection character count without spaces', () => {
    it('Simple word count', selectionCharacterCountWithoutSpaces('<p>My sentence is this.</p>', 10, {
      startPath: [ 0, 0 ],
      soffset: 2,
      finishPath: [ 0, 0 ],
      foffset: 15
    }));
  });
});
