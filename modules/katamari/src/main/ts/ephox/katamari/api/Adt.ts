import * as Arr from './Arr';
import * as Obj from './Obj';
import * as Type from './Type';
import { console } from '@ephox/dom-globals';

export interface Adt {
  fold: <T> (...caseHandlers: ((...data: any[]) => T)[]) => T;
  match: <T> (branches: { [branch: string]: (...data: any[]) => T; }) => T;
  log: (label: string) => void;
};

/*
 * Generates a church encoded ADT (https://en.wikipedia.org/wiki/Church_encoding)
 * For syntax and use, look at the test code.
 */
var generate = function <T = Record<string,(...data: any[]) => Adt>> (cases: { [key: string]: string[] }[]): T {
  // validation
  if (!Type.isArray(cases)) {
    throw new Error('cases must be an array');
  }
  if (cases.length === 0) {
    throw new Error('there must be at least one case');
  }

  const constructors: string[] = [];

  // adt is mutated to add the individual cases
  const adt: Record<string,(...data: any[]) => Adt> = {};
  Arr.each(cases, function (acase, count) {
    const keys: string[] = Obj.keys(acase);

    // validation
    if (keys.length !== 1) {
      throw new Error('one and only one name per case');
    }

    const key = keys[0];
    const value = acase[key];

    // validation
    if (adt[key] !== undefined) {
      throw new Error('duplicate key detected:' + key);
    } else if (key === 'cata') {
      throw new Error('cannot have a case named cata (sorry)');
    } else if (!Type.isArray(value)) {
      // this implicitly checks if acase is an object
      throw new Error('case arguments must be an array');
    }

    constructors.push(key);
    //
    // constructor for key
    //
    adt[key] = function (): Adt {
      const argLength = arguments.length;

      // validation
      if (argLength !== value.length) {
        throw new Error('Wrong number of arguments to case ' + key + '. Expected ' + value.length + ' (' + value + '), got ' + argLength);
      }

      // Don't use array slice(arguments), makes the whole function unoptimisable on Chrome
      const args = new Array(argLength);
      for (let i = 0; i < args.length; i++) args[i] = arguments[i];


      const match = function (branches: { [branch: string]: Function }) {
        const branchKeys: string[] = Obj.keys(branches);
        if (constructors.length !== branchKeys.length) {
          throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
        }

        const allReqd = Arr.forall(constructors, function (reqKey) {
          return Arr.contains(branchKeys, reqKey);
        });

        if (!allReqd) throw new Error('Not all branches were specified when using match. Specified: ' + branchKeys.join(', ') + '\nRequired: ' + constructors.join(', '));

        return branches[key].apply(null, args);
      };

      //
      // the fold function for key
      //
      return {
        fold: function (/* arguments */) {
          // runtime validation
          if (arguments.length !== cases.length) {
            throw new Error('Wrong number of arguments to fold. Expected ' + cases.length + ', got ' + arguments.length);
          }
          const target = arguments[count];
          return target.apply(null, args);
        },
        match: match,

        // NOTE: Only for debugging.
        log: function (label) {
          console.log(label, {
            constructors: constructors,
            constructor: key,
            params: args
          });
        }
      };
    };
  });

  return <any>adt;
};

export const Adt = {
  generate: generate
};