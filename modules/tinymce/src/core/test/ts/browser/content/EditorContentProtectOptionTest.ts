import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.content.EditorContentProtectOptionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    protect: [
      /\<\/?(if|endif)\>/g,
      /\<xsl\:[^>]+\>/g,
      /<\?php.*?\?>/g
    ],
    indent: false
  });

  context('Valid protect content', () => {
    const testValidProtect = (testCase: { input: string; expected: string }) => {
      const editor = hook.editor();

      editor.setContent(testCase.input);

      TinyAssertions.assertContent(editor, testCase.expected);
    };

    it('TINY-14353: Protect tags', () => testValidProtect({
      input: '<p>A</p><if><p>B</p></if><p>C</p>',
      expected: '<p>A</p><if><p>B</p></if><p>C</p>'
    }));

    it('TINY-14353: Protect xsl', () => testValidProtect({
      input: '<p>A</p><xsl:foo><p>B</p><p>C</p>',
      expected: '<p>A</p><xsl:foo><p>B</p><p>C</p>'
    }));

    it('TINY-14353: Protect php', () => testValidProtect({
      input: '<p>A</p><?php echo "B"; ?><p>C</p>',
      expected: '<p>A</p><?php echo "B"; ?><p>C</p>'
    }));

    it('TINY-14353: Protect multiple tags', () => testValidProtect({
      input: '<p>A</p><if><p>B</p></if><xsl:foo><p>C</p><?php echo "D"; ?><p>E</p>',
      expected: '<p>A</p><if><p>B</p></if><xsl:foo><p>C</p><?php echo "D"; ?><p>E</p>'
    }));
  });

  context('Raw comment injection', () => {
    const platform = PlatformDetection.detect();
    const testInnerContent = (testCase: { innerContent: string; expected: string }) => {
      const editor = hook.editor();

      editor.setContent(`<!--mce:protected ${encodeURIComponent(testCase.innerContent)}-->`);
      TinyAssertions.assertContent(editor, testCase.expected);

      editor.setContent(`<!--mce:protected ${encodeURIComponent(testCase.innerContent)}-->`, { format: 'raw' });
      TinyAssertions.assertContent(editor, testCase.expected);
    };

    it('TINY-14353: Script payload should not be allowed', () => testInnerContent({
      innerContent: '<script>alert(1)</script>',
      expected: ''
    }));

    it('TINY-14353: Img with attribute payload should not be allowed', () => testInnerContent({
      innerContent: '<img src="#" onerror="alert(1)">',
      expected: ''
    }));

    it('TINY-14353: Script payload with partial matching protect should not be allowed', () => testInnerContent({
      innerContent: '<if><script>alert(1)</script>',
      expected: ''
    }));

    it('TINY-14353: Valid content', () => testInnerContent({
      innerContent: '<if>',
      expected: platform.browser.isFirefox() ? '<p>&nbsp;</p><if>' : '<if>'
    }));
  });
});
