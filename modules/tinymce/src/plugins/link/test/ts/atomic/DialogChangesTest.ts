import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import { DialogChanges, DialogDelta } from 'tinymce/plugins/link/ui/DialogChanges';
import { LinkDialogData, ListItem } from 'tinymce/plugins/link/ui/DialogTypes';

UnitTest.test('DialogChanges', () => {

  Logger.sync(
    'Basic test',
    () => {
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
          actual.each(
            (_a) => { throw new Error('Should not have found replacement text'); }
          );
        });
      };

      const assertSome = (label: string, expected: DialogDelta, previousText: string, catalog: ListItem[], data: Partial<LinkDialogData>) => {
        Logger.sync('assertSome(' + label + ')', () => {
          const actual = DialogChanges.getDelta(previousText, 'anchor', catalog, data);
          Assert.eq('Checking replacement text', expected, actual.getOrDie(
            'Should be some'
          ));
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

    }
  );
});
