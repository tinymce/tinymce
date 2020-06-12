import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';
import * as DomModification from 'ephox/alloy/dom/DomModification';

interface ModifiationType {
  classes: string[];
  attributes: Record<string, string>;
  styles: Record<string, string>;
}

interface DefinitionType {
  uid: string;
  tag: string;
  classes: string[];
  attributes: Record<string, string>;
  styles: Record<string, string>;
  value: Option<string>;
  innerHtml: Option<string>;
  domChildren: Element[];
}

UnitTest.test('DomDefinitionTest', () => {
  // TODO: Add property based tests.

  // Since making DomDefinition just the value after defaulting, this
  // test became a lot less useful. Therefore, we'll just test a few
  // properties

  const arbOptionOf = <T>(arb: any) => Jsc.tuple([ Jsc.bool, arb ]).smap(
    (arr: [boolean, string]) => arr[0] ? Option.some(arr[1]) : Option.none(),
    (opt: Option<string>) => opt.fold(
      () => [ false, '' ],
      (v) => [ true, v ]
    ),
    (opt: Option<string>) => opt.fold(
      () => 'None',
      (v) => 'Some(' + v + ')'
    )
  );

  const arbDefinition = Jsc.tuple([
    Jsc.nestring,
    Jsc.nestring,
    Jsc.array(Jsc.nestring),
    Jsc.dict(Jsc.nestring),
    Jsc.dict(Jsc.nestring),
    arbOptionOf(Jsc.string),
    arbOptionOf(Jsc.string)
  ]).smap(
    (arr: [string, string, string[], Record<string, string>, Record<string, string>, Option<string>, Option<string>]) => ({
      uid: arr[0],
      tag: arr[1],
      classes: arr[2],
      attributes: arr[3],
      styles: arr[4],
      value: arr[5],
      innerHtml: arr[6],
      domChildren: [ ] as Element[]
    }),
    (defn: DefinitionType) => [ defn.uid, defn.tag, defn.classes, defn.attributes, defn.styles, defn.value, defn.innerHtml, defn.domChildren ],
    (defn: DefinitionType) => JSON.stringify({
      'Definition arbitrary': defn
    }, null, 2)
  );

  const arbModification = Jsc.tuple([
    Jsc.array(Jsc.nestring),
    Jsc.dict(Jsc.nestring),
    Jsc.dict(Jsc.nestring)
  ]).smap(
    (arr: [ string[], Record<string, string>, Record<string, string>]) => ({
      classes: arr[0],
      attributes: arr[1],
      styles: arr[2]
    }),
    (mod: ModifiationType) => [ mod.classes, mod.attributes, mod.styles ],
    (mod: ModifiationType) => JSON.stringify({
      'Modification arbitrary': mod
    }, null, 2)
  );

  Jsc.syncProperty(
    'Testing whatever is in modification, ends up in result',
    [
      arbDefinition,
      arbModification
    ], (defn: DefinitionType, mod: ModifiationType) => {
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
          result.styles[k] === v || result.styles[k] === mod.styles[k] && mod.styles.hasOwnProperty(k)
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
          result.attributes[k] === v || result.attributes[k] === mod.attributes[k] && mod.attributes.hasOwnProperty(k)
        );
      });
      return true;
    },
    {
      tests: 100
    }
  );

});
