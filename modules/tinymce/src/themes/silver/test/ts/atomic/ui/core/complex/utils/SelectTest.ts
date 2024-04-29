import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Delimiter, makeBasicSelectItems } from 'tinymce/themes/silver/ui/core/complex/utils/Select';

describe('atomic.tinymce.themes.silver.ui.core.complex.utils.Select', () => {
  context('makeBasicSelectItems', () => {
    it('Works with a semicolon delimiter', () => {
      const config = 'Paragraph=p; Heading 1=h1;Heading 2=h2; Heading 3 =h3;Pre =pre';
      const items = makeBasicSelectItems(config, Delimiter.SemiColon);
      assert.isArray(items);
      assert.lengthOf(items, 5);
      assert.deepEqual(items, [
        { title: 'Paragraph', format: 'p' },
        { title: 'Heading 1', format: 'h1' },
        { title: 'Heading 2', format: 'h2' },
        { title: 'Heading 3', format: 'h3' },
        { title: 'Pre', format: 'pre' }
      ]);
    });
    it('Works with a space delimiter', () => {
      const config = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';
      const items = makeBasicSelectItems(config, Delimiter.Space);
      assert.isArray(items);
      assert.lengthOf(items, 7);
      assert.deepEqual(items, [
        { title: '8pt', format: '8pt' },
        { title: '10pt', format: '10pt' },
        { title: '12pt', format: '12pt' },
        { title: '14pt', format: '14pt' },
        { title: '18pt', format: '18pt' },
        { title: '24pt', format: '24pt' },
        { title: '36pt', format: '36pt' }
      ]);
    });
    it('Works with a mix of text/value items', () => {
      const config = 'Paragraph = p ; pre';
      const items = makeBasicSelectItems(config, Delimiter.SemiColon);
      assert.isArray(items);
      assert.lengthOf(items, 2);
      assert.deepEqual(items, [
        { title: 'Paragraph', format: 'p' },
        { title: 'pre', format: 'pre' }
      ]);
    });
  });
});
