import { Assert, describe, context, it } from '@ephox/bedrock-client';
import { Fun, Optional, OptionalInstances } from '@ephox/katamari';
import fc from 'fast-check';

import { DialogChanges, DialogDelta } from 'tinymce/plugins/link/ui/DialogChanges';
import { LinkDialogCatalog, LinkDialogData, ListItem } from 'tinymce/plugins/link/ui/DialogTypes';

const tOptional = OptionalInstances.tOptional;

describe('browser.tinymce.plugins.link.DialogChangesTest', () => {
  context('getDelta', () => {
    const anchorList: ListItem[] = [
      { value: 'alpha', text: 'Alpha' },
      {
        text: 'GroupB',
        items: [
          { value: 'gamma', text: 'Gamma' }
        ]
      }
    ];

    const assertNone = (previousText: string, catalog: ListItem[], data: Partial<LinkDialogData>) => {
      const actual = DialogChanges.getDelta(previousText, 'anchor', catalog, data);
      Assert.eq('Should not have found replacement text', Optional.none(), actual, tOptional());
    };

    const assertSome = (expected: DialogDelta, previousText: string, catalog: ListItem[], data: Partial<LinkDialogData>) => {
      const actual = DialogChanges.getDelta(previousText, 'anchor', catalog, data);
      Assert.eq('Checking replacement text', Optional.some(expected), actual, tOptional());
    };

    it('Current text empty + Has mapping', () => {
      assertSome({
        url: {
          value: 'alpha',
          meta: {
            attach: Fun.noop,
            text: 'Alpha'
          }
        },
        text: 'Alpha'
      }, '', anchorList, {
        anchor: 'alpha',
        text: ''
      });
    });

    it('Current text empty + Has no mapping', () => {
      assertNone('', anchorList, {
        anchor: 'beta',
        text: ''
      });
    });

    it('Current text empty + Has mapping in nested list', () => {
      assertSome({
        url: {
          value: 'gamma',
          meta: {
            attach: Fun.noop,
            text: 'Gamma'
          }
        },
        text: 'Gamma'
      }, '', anchorList, {
        anchor: 'gamma',
        text: ''
      });
    });
  });

  context('init', () => {
    it('no initial data', () => {
      const dialogChange = DialogChanges.init({ title: '', text: '' } as LinkDialogData, { } as LinkDialogCatalog);

      fc.assert(fc.property(fc.webUrl(), fc.asciiString(), fc.asciiString(), (url, title, text) => {
        const data = Fun.constant({ url: {
          value: url,
          meta: { title, text }
        }} as LinkDialogData);
        const dataNoMeta = Fun.constant({ url: {
          value: url,
          meta: { }
        }} as LinkDialogData);

        Assert.eq('on url change should include url title and text',
          Optional.some<Partial<LinkDialogData>>({ title, text }),
          dialogChange.onChange(data, { name: 'url' }),
          tOptional()
        );

        Assert.eq('on url change should fallback to url for text',
          Optional.some<Partial<LinkDialogData>>({ title: '', text: url }),
          dialogChange.onChange(dataNoMeta, { name: 'url' }),
          tOptional()
        );
      }));
    });

    it('with original data', () => {
      const dialogChange = DialogChanges.init({ title: 'orig title', text: 'orig text' } as LinkDialogData, { } as LinkDialogCatalog);
      const dialogChangeNoTitle = DialogChanges.init({ title: '', text: 'orig text' } as LinkDialogData, { } as LinkDialogCatalog);
      const dialogChangeNoText = DialogChanges.init({ title: 'orig title', text: '' } as LinkDialogData, { } as LinkDialogCatalog);

      fc.assert(fc.property(fc.webUrl(), fc.asciiString(), fc.asciiString(), (url, title, text) => {
        const data = Fun.constant({ url: {
          value: url,
          meta: { title, text }
        }} as LinkDialogData);

        Assert.eq('on url change should not try to change title and text',
          Optional.none(),
          dialogChange.onChange(data, { name: 'url' }),
          tOptional()
        );

        Assert.eq('No Title - on url change should only try to change title',
          Optional.some<Partial<LinkDialogData>>({ title }),
          dialogChangeNoTitle.onChange(data, { name: 'url' }),
          tOptional()
        );

        Assert.eq('No Text - on url change should only try to change text',
          Optional.some<Partial<LinkDialogData>>({ text }),
          dialogChangeNoText.onChange(data, { name: 'url' }),
          tOptional()
        );
      }));
    });
  });
});

