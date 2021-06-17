import { Assert, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, OptionalInstances } from '@ephox/katamari';
import { assert } from 'chai';
import fc from 'fast-check';

import { parseStartValue, parseDetail, ListDetail } from 'tinymce/plugins/lists/core/ListNumbering';

describe('atomic.tinymce.plugins.lists.core.ListNumberingTest', () => {
  const tOptional = OptionalInstances.tOptional;

  const check = (startValue: string, expectedDetail: Optional<ListDetail>) => {
    expectedDetail.each((expected) => {
      // Test conversion of: start value -> detail
      const actualDetail = parseStartValue(startValue);
      Assert.eq('Should convert start value to expected start value', expected.start, actualDetail.getOrDie().start);
      Assert.eq('Should convert start value to expected list style type', expected.listStyleType, actualDetail.getOrDie().listStyleType, tOptional());

      // When expectedDetail is some, try to convert: detail -> start value
      expectedDetail.map(parseDetail).each((initialStartValue) => {
        assert.equal(startValue, initialStartValue, 'Should convert detail back to initial start value');
      });
    });
  };

  it('TINY-6891: Converts number -> numbered list type detail -> back to initial number', () => check(
    '1',
    Optional.some({ start: '1', listStyleType: Optional.none() })
  ));

  it('TINY-6891: Converts lowercase letter -> lower-alpha list type detail -> back to initial lowercase letter', () => {
    check(
      'a',
      Optional.some({ start: '1', listStyleType: Optional.some('lower-alpha') })
    );
    check(
      'z',
      Optional.some({ start: '26', listStyleType: Optional.some('lower-alpha') })
    );
  });

  it('TINY-6891: Converts uppercase letters -> upper-alpha list type detail -> back to initial uppercase letters', () => {
    check(
      'A',
      Optional.some({ start: '1', listStyleType: Optional.some('upper-alpha') })
    );
    check(
      'ABCD',
      Optional.some({ start: '19010', listStyleType: Optional.some('upper-alpha') })
    );
  });

  it('TINY-6891: Does not convert if the start value is ambiguous', () => {
    check(
      'ABC123',
      Optional.none()
    );
    check(
      'aB',
      Optional.none()
    );
  });

  it('TINY-6891: Should be able to convert to and from numbers/list numbering', () => {
    const arbitrary = Arr.map([
      fc.mapToConstant({ num: 26, build: (v) => String.fromCharCode(65 + v) }),
      fc.mapToConstant({ num: 26, build: (v) => String.fromCharCode(97 + v) }),
      fc.mapToConstant({ num: 10, build: (v) => v.toString() })
    ], (c) => fc.stringOf(c, 1, 5));

    fc.assert(fc.property(
      fc.oneof(...arbitrary),
      (start) => {
        assert.equal(
          start,
          parseStartValue(start).map(parseDetail).getOrDie(),
          'Should be initial start value'
        );
      }
    ), { endOnFailure: true });
  });
});
