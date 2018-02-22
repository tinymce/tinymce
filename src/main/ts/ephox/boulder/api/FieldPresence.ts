import { Adt } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { EncodedAdt } from '../core/ValueProcessor';

var adt = Adt.generate([
  { strict: [ ] },
  { defaultedThunk: [ 'fallbackThunk' ] },
  { asOption: [ ] },
  { asDefaultedOptionThunk: [ 'fallbackThunk' ] },
  { mergeWithThunk: [ 'baseThunk' ] }
]);

var defaulted = function <a>(fallback: a): EncodedAdt {
  return adt.defaultedThunk(
    Fun.constant(fallback)
  );

};

var asDefaultedOption = function <a>(fallback: a): EncodedAdt {
  return adt.asDefaultedOptionThunk(
    Fun.constant(fallback)
  );
};

var mergeWith = function (base:{}): EncodedAdt {
  return adt.mergeWithThunk(
    Fun.constant(base)
  );
};

export default <any> {
  strict: adt.strict,
  asOption: adt.asOption,
  
  defaulted: defaulted,
  defaultedThunk: adt.defaultedThunk,
  
  asDefaultedOption: asDefaultedOption,      
  asDefaultedOptionThunk: adt.asDefaultedOptionThunk,

  mergeWith: mergeWith,
  mergeWithThunk: adt.mergeWithThunk
};