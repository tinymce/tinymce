import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';
import { Gene } from 'ephox/boss/api/Gene';
import * as Creator from 'ephox/boss/mutant/Creator';
import * as Locator from 'ephox/boss/mutant/Locator';
import * as Tracks from 'ephox/boss/mutant/Tracks';

import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('LocatorTest', function () {
  const family = Tracks.track(
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.'),
        Creator.text('cattle')
      ])
    ]), Option.none());

  const getId = (x: Gene) => x.id;

  KAssert.eqSome('locate D', 'D', Locator.byId(family, 'D').map(getId));
  KAssert.eqSome('locate A', 'A', Locator.byId(family, 'A').map(getId));
  KAssert.eqNone('cattle .', Locator.byItem(family, Gene('?_cattle', '.')));
  KAssert.eqSome('cattle', '?_cattle', Locator.byId(family, '?_cattle').bind((x) => Locator.byItem(family, x)).map(getId));
  KAssert.eqNone('locate Z', Locator.byId(family, 'Z'));
});
