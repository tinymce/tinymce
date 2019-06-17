import { Logger } from '@ephox/agar';
import { assert, UnitTest } from '@ephox/bedrock';
import * as DomDefinition from 'ephox/alloy/dom/DomDefinition';
import * as DomModification from 'ephox/alloy/dom/DomModification';
import { Option, Arr, Obj } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';
import { RawAssertions } from '@ephox/agar';

UnitTest.test('DomDefinitionTest', () => {
  /* global assert */
  // TODO: Add property based tests.

  // Since making DomDefinition just the value after defaulting, this
  // test became a lot less useful. Therefore, we'll just test a few
  // properties

  const arbOptionOf = (arb) => Jsc.tuple([ Jsc.bool, arb ]).smap(
    (arr) => {
      return arr[0] ? Option.some(arr[1]) : Option.none()
    },
    (opt) => {
      return opt.fold(
        () => [ false, '' ],
        (v) => [ true, v ]
      );
    },
    (opt) => opt.fold(
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
    (arr) => {
      return {
        uid: arr[0],
        tag: arr[1],
        classes: arr[2],
        attributes: arr[3],
        styles: arr[4],
        value: arr[5],
        innerHtml: arr[6]
      };
    },
    (defn) => {
      return [ defn.uid, defn.tag, defn.classes, defn.attributes, defn.styles, defn.value, defn.innerHtml ];
    },
    (defn) => {
      return JSON.stringify({
        'Definition arbitrary': defn
      }, null, 2);
    }
  );

  const arbModification = Jsc.tuple([
    Jsc.array(Jsc.nestring),
    Jsc.dict(Jsc.nestring),
    Jsc.dict(Jsc.nestring)
  ]).smap(
    (arr) => {
      return {
        classes: arr[0],
        attributes: arr[1],
        styles: arr[2],
      }
    },
    (mod) => {
      return [ mod.classes, mod.attributes, mod.styles ]
    },
    (mod) => {
      return JSON.stringify({
        'Modification arbitrary': mod
      }, null, 2)
    }
  );

  Jsc.syncProperty(
    'Testing whatever is in modification, ends up in result',
    [
      arbDefinition,
      arbModification
    ], (defn, mod) => {
      const result = DomModification.merge(defn, mod);
      RawAssertions.assertEq(
        'All classes in mod should be in final result: ' + JSON.stringify(result, null, 2) + '. Should be none left over.',
        [ ],
        Arr.difference(mod.classes, result.classes)
      );
      RawAssertions.assertEq(
        'All classes in defn should be in final result ' + JSON.stringify(result, null, 2) + '.too. Should be none left over.',
        [ ],
        Arr.difference(defn.classes, result.classes)
      );
      RawAssertions.assertEq(
        'All styles from modification should be in final result' + JSON.stringify(result, null, 2) + '.',
        true,
        Obj.find(mod.styles, (v, k) => result.styles[k] !== v).isNone()
      );

      Obj.each(defn.styles, (v, k) => {
        RawAssertions.assertEq(
          'Defn Style: ' + k + '=' + v + ' should appear in result: ' + JSON.stringify(result, null, 2) + '., unless modification changed it',
          true,
          result.styles[k] === v || result.styles[k] === mod.styles[k] && mod.styles.hasOwnProperty(k)
        );
      })

      RawAssertions.assertEq(
        'All attributes from modification should be in final result' + JSON.stringify(result, null, 2) + '.',
        true,
        Obj.find(mod.attributes, (v, k) => result.attributes[k] !== v).isNone()
      );

      Obj.each(defn.attributes, (v, k) => {
        RawAssertions.assertEq(
          'Defn attribute: ' + k + '=' + v + ' should appear in result: ' + JSON.stringify(result, null, 2) + '., unless modification changed it',
          true,
          result.attributes[k] === v || result.attributes[k] === mod.attributes[k] && mod.attributes.hasOwnProperty(k)
        );
      })
      return true;
    },
    {
      tests: 100
    }
  );


});
