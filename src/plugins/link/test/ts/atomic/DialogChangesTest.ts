import { Logger, RawAssertions, UnitTest } from '@ephox/agar';

import { DialogChanges } from '../../../main/ts/ui/DialogChanges';
import { ListItem, LinkDialogData } from '../../../main/ts/ui/DialogTypes';
import { Fun } from '@ephox/katamari';

UnitTest.test('DialogChanges', () => {

  Logger.sync(
    'Basic test',
    () => {
      const anchorList: ListItem[] = [
        { value: 'alpha', text: 'Alpha' },
        {
          text: 'GroupB',
          items: [
            { value: 'gamma', text: 'Gamma' }
          ]
        }
      ];

      const assertNone = (label: string, previousText: string, catalog: ListItem[], data: Partial<LinkDialogData>) => {
        Logger.sync('assertNone(' + label + ')', () => {
          const actual = DialogChanges.getDelta(previousText, 'anchor', catalog, data);
          actual.each(
            (a) => { throw new Error('Should not have found replacement text'); }
          );
        });
      };

      const assertSome = (label: string, expected: { url: { value: string, text: string, meta: { attach: Function } }, text: string }, previousText: string, catalog: ListItem[], data: Partial<LinkDialogData>) => {
        Logger.sync('assertSome(' + label + ')', () => {
          const actual = DialogChanges.getDelta(previousText, 'anchor', catalog, data);
          RawAssertions.assertEq('Checking replacement text', expected, actual.getOrDie(
            'Should be some'
          ));
        });
      };

      assertSome('Current text empty + Has mapping', {
        url: {
          value: 'alpha',
          text: 'Alpha',
          meta: {
            attach: Fun.noop
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

      assertSome('Current text empty + Has mapping in nested list', {
        url: {
          value: 'gamma',
          text: 'Gamma',
          meta: {
            attach: Fun.noop
          }
        },
        text: 'Gamma'
      }, '', anchorList, {
        anchor: 'gamma',
        text: ''
      });

    }
  );
});