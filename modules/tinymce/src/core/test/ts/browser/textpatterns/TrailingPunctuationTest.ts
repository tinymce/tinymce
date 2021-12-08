import { ApproxStructure, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.textpatterns.TrailingPunctuationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ ], true);

  const pTypeAndTriggerTest = (patternText: string, trigger: string, tag: string, rawText: string) => async () => {
    const editor = hook.editor();
    editor.setContent('<p>' + patternText + trigger + '</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], patternText.length + 1);
    TinyContentActions.keypress(editor, trigger.charCodeAt(0));
    await Waiter.pTryUntil(
      'did not get expected format',
      () => TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element(tag, {
                  children: [
                    s.text(str.is(rawText))
                  ]
                }),
                s.text(str.is(trigger), true)
              ]
            })
          ]
        });
      }))
    );
  };

  context('em', () => {
    it('with ,', pTypeAndTriggerTest('*a*', ',', 'em', 'a'));
    it('with .', pTypeAndTriggerTest('*a*', '.', 'em', 'a'));
    it('with ;', pTypeAndTriggerTest('*a*', ';', 'em', 'a'));
    it('with :', pTypeAndTriggerTest('*a*', ':', 'em', 'a'));
    it('with !', pTypeAndTriggerTest('*a*', '!', 'em', 'a'));
    it('with ?', pTypeAndTriggerTest('*a*', '?', 'em', 'a'));
  });

  context('strong', () => {
    it('with ,', pTypeAndTriggerTest('**a**', ',', 'strong', 'a'));
    it('with .', pTypeAndTriggerTest('**a**', '.', 'strong', 'a'));
    it('with ;', pTypeAndTriggerTest('**a**', ';', 'strong', 'a'));
    it('with :', pTypeAndTriggerTest('**a**', ':', 'strong', 'a'));
    it('with !', pTypeAndTriggerTest('**a**', '!', 'strong', 'a'));
    it('with ?', pTypeAndTriggerTest('**a**', '?', 'strong', 'a'));
  });
});
