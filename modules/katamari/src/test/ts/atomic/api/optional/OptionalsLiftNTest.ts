import { describe, it } from '@ephox/bedrock-client';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertOptional } from 'ephox/katamari/test/AssertOptional';

const boom = Fun.die('should not be called');

describe('atomic.katamari.api.optional.OptionalsLiftNTest', () => {
  it('Optionals.lift2', () => {
    assertNone(Optionals.lift2(Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift2(Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift2(Optional.some<string>('a'), Optional.none<number>(), boom));
    assertOptional(Optionals.lift2(Optional.some<string>('a'), Optional.some<number>(11), (a, b) => a + b), Optional.some<string>('a11'));
  });

  it('Optionals.lift3', () => {
    assertNone(Optionals.lift3(Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift3(Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift3(Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));

    assertNone(Optionals.lift3(Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift3(Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift3(Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

    assertOptional(Optionals.lift3(Optional.some<string>('z'), Optional.some<string>('a'), Optional.some<number>(11), (a, b, c) => a + b + c), Optional.some<string>('za11'));
  });

  it('Optionals.lift4', () => {
    assertNone(Optionals.lift4(Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift4(Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift4(Optional.none<number>(), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
    assertNone(Optionals.lift4(Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift4(Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift4(Optional.none<number>(), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

    assertNone(Optionals.lift4(Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift4(Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift4(Optional.some<number>(1), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
    assertNone(Optionals.lift4(Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift4(Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift4(Optional.some<number>(1), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

    assertOptional(Optionals.lift4(Optional.some<number>(2), Optional.some<string>('z'), Optional.some<string>('a'), Optional.some<number>(11), (a, b, c, d) => a + b + c + d), Optional.some<string>('2za11'));
  });

  it('Optionals.lift5', () => {
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.none<number>(), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift5(Optional.none<boolean>(), Optional.some<number>(1), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.none<number>(), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.none<string>(), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.none<string>(), Optional.some<string>('a'), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.none<number>(), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.some<string>('z'), Optional.none<string>(), Optional.some<number>(3), boom));
    assertNone(Optionals.lift5(Optional.some<boolean>(true), Optional.some<number>(1), Optional.some<string>('z'), Optional.some<string>('a'), Optional.none<number>(), boom));

    assertOptional(Optionals.lift5(Optional.some<boolean>(false), Optional.some<number>(2), Optional.some<string>('z'), Optional.some<string>('a'), Optional.some<number>(11), (a, b, c, d, e) => a + '' + b + c + d + e), Optional.some<string>('false2za11'));
  });
});
