import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Option, OptionInstances } from '@ephox/katamari';
import fc from 'fast-check';

import { DialogChanges, DialogDelta } from 'tinymce/plugins/link/ui/DialogChanges';
import { LinkDialogCatalog, LinkDialogData, ListItem } from 'tinymce/plugins/link/ui/DialogTypes';

const tOption = OptionInstances.tOption;

UnitTest.test('DialogChanges.getDelta', () => {
  // TODO TINY-2236 re-enable this (support will need to be added to bridge)
  const anchorList: ListItem[] = [
    { value: 'alpha', text: 'Alpha' }
    /* {
      text: 'GroupB',
      items: [
        { value: 'gamma', text: 'Gamma' }
      ]
    } */
  ];

  const assertNone = (label: string, previousText: string, catalog: ListItem[], data: Partial<LinkDialogData>) => {
    Logger.sync('assertNone(' + label + ')', () => {
      const actual = DialogChanges.getDelta(previousText, 'anchor', catalog, data);
      Assert.eq('Should not have found replacement text', Option.none(), actual, tOption());
    });
  };

  const assertSome = (label: string, expected: DialogDelta, previousText: string, catalog: ListItem[], data: Partial<LinkDialogData>) => {
    Logger.sync('assertSome(' + label + ')', () => {
      const actual = DialogChanges.getDelta(previousText, 'anchor', catalog, data);
      Assert.eq('Checking replacement text', Option.some(expected), actual, tOption());
    });
  };

  assertSome('Current text empty + Has mapping', {
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

  assertNone('Current text empty + Has no mapping', '', anchorList, {
    anchor: 'beta',
    text: ''
  });

  // TODO TINY-2236 re-enable this (support will need to be added to bridge)
  /* assertSome('Current text empty + Has mapping in nested list', {
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
  }); */
});

UnitTest.test('DialogChanges.init - no initial data', () => {
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
      Option.some<Partial<LinkDialogData>>({ title, text }),
      dialogChange.onChange(data, { name: 'url' }),
      tOption()
    );

    Assert.eq('on url change should fallback to url for text',
      Option.some<Partial<LinkDialogData>>({ title: '', text: url }),
      dialogChange.onChange(dataNoMeta, { name: 'url' }),
      tOption()
    );
  }));
});

UnitTest.test('DialogChanges.init - with original data', () => {
  const dialogChange = DialogChanges.init({ title: 'orig title', text: 'orig text' } as LinkDialogData, { } as LinkDialogCatalog);
  const dialogChangeNoTitle = DialogChanges.init({ title: '', text: 'orig text' } as LinkDialogData, { } as LinkDialogCatalog);
  const dialogChangeNoText = DialogChanges.init({ title: 'orig title', text: '' } as LinkDialogData, { } as LinkDialogCatalog);

  fc.assert(fc.property(fc.webUrl(), fc.asciiString(), fc.asciiString(), (url, title, text) => {
    const data = Fun.constant({ url: {
      value: url,
      meta: { title, text }
    }} as LinkDialogData);

    Assert.eq('on url change should not try to change title and text',
      Option.none(),
      dialogChange.onChange(data, { name: 'url' }),
      tOption()
    );

    Assert.eq('No Title - on url change should only try to change title',
      Option.some<Partial<LinkDialogData>>({ title }),
      dialogChangeNoTitle.onChange(data, { name: 'url' }),
      tOption()
    );

    Assert.eq('No Text - on url change should only try to change text',
      Option.some<Partial<LinkDialogData>>({ text }),
      dialogChangeNoText.onChange(data, { name: 'url' }),
      tOption()
    );
  }));
});
