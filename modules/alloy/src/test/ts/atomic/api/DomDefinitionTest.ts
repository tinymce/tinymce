import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj, Optional } from '@ephox/katamari';
import * as fc from 'fast-check';

import { DomDefinitionDetail } from 'ephox/alloy/dom/DomDefinition';
import * as DomModification from 'ephox/alloy/dom/DomModification';

UnitTest.test('DomDefinitionTest', () => {
  // TODO: Add property based tests.

  // Since making DomDefinition just the value after defaulting, this
  // test became a lot less useful. Therefore, we'll just test a few
  // properties

  const arbOptionOf = (arb: fc.Arbitrary<string>) => fc.tuple(fc.boolean(), arb).map(
    (arr: [boolean, string]) => arr[0] ? Optional.some(arr[1]) : Optional.none()
  );

  const nestring = fc.string({ minLength: 1 });
  const arbDefinition = fc.tuple(
    nestring,
    nestring,
    fc.array(nestring),
    fc.dictionary(nestring, nestring),
    fc.dictionary(nestring, nestring),
    arbOptionOf(fc.string()),
    arbOptionOf(fc.string())
  ).map((arr: [string, string, string[], Record<string, string>, Record<string, string>, Optional<string>, Optional<string>]): DomDefinitionDetail => ({
    uid: arr[0],
    tag: arr[1],
    classes: arr[2],
    attributes: arr[3],
    styles: arr[4],
    value: arr[5],
    innerHtml: arr[6],
    domChildren: [ ]
  }));

  const arbModification = fc.tuple(
    fc.array(nestring),
    fc.dictionary(nestring, nestring),
    fc.dictionary(nestring, nestring)
  ).map((arr: [ string[], Record<string, string>, Record<string, string>]): DomModification.DomModification => ({
    classes: arr[0],
    attributes: arr[1],
    styles: arr[2]
  }));

  fc.assert(fc.property(arbDefinition, arbModification, (defn, mod) => {
    const result = DomModification.merge(defn, mod);
    Assert.eq(
      () => 'All classes in mod should be in final result: ' + JSON.stringify(result, null, 2) + '. Should be none left over.',
      [ ],
      Arr.difference(mod.classes, result.classes)
    );
    Assert.eq(
      () => 'All classes in defn should be in final result ' + JSON.stringify(result, null, 2) + '.too. Should be none left over.',
      [ ],
      Arr.difference(defn.classes, result.classes)
    );
    Assert.eq(
      () => 'All styles from modification should be in final result' + JSON.stringify(result, null, 2) + '.',
      true,
      Obj.find(mod.styles, (v, k) => result.styles[k] !== v).isNone()
    );

    Obj.each(defn.styles, (v, k) => {
      Assert.eq(
        () => 'Defn Style: ' + k + '=' + v + ' should appear in result: ' + JSON.stringify(result, null, 2) + '., unless modification changed it',
        true,
        result.styles[k] === v || result.styles[k] === mod.styles[k] && Obj.has(mod.styles, k)
      );
    });

    Assert.eq(
      () => 'All attributes from modification should be in final result' + JSON.stringify(result, null, 2) + '.',
      true,
      Obj.find(mod.attributes, (v, k) => result.attributes[k] !== v).isNone()
    );

    Obj.each(defn.attributes, (v, k) => {
      Assert.eq(
        () => 'Defn attribute: ' + k + '=' + v + ' should appear in result: ' + JSON.stringify(result, null, 2) + '., unless modification changed it',
        true,
        result.attributes[k] === v || result.attributes[k] === mod.attributes[k] && Obj.has(mod.attributes, k)
      );
    });
  }));

});
