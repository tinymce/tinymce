/*!
 * Benchmark.js <http://benchmarkjs.com/>
 * Copyright 2010-2011 Mathias Bynens <http://mths.be/>
 * Based on JSLitmus.js, copyright Robert Kieffer <http://broofa.com/>
 * Modified by John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function(window, undefined) {

  /** Detect free variable `define` */
  var freeDefine = typeof define == 'function' &&
    typeof define.amd == 'object' && define.amd && define,

  /** Detect free variable `exports` */
  freeExports = typeof exports == 'object' && exports &&
    (typeof global == 'object' && global && global == global.global && (window = global), exports),

  /** Detect free variable `require` */
  freeRequire = typeof require == 'function' && require,

  /** Used to assign each benchmark an incrimented id */
  counter = 0,

  /** Used to crawl all properties regardless of enumerability */
  getAllKeys = Object.getOwnPropertyNames,

  /** Used to get property descriptors */
  getDescriptor = Object.getOwnPropertyDescriptor,

  /** Used in case an object doesn't have its own method */
  hasOwnProperty = {}.hasOwnProperty,

  /** Used to check if an object is extensible */
  isExtensible = Object.isExtensible || function() { return true; },

  /** Used to check if an own property is enumerable */
  propertyIsEnumerable = {}.propertyIsEnumerable,

  /** Used to set property descriptors */
  setDescriptor = Object.defineProperty,

  /** Used to resolve a value's internal [[Class]] */
  toString = {}.toString,

  /** Used to integrity check compiled tests */
  uid = 'uid' + (+new Date),

  /** Used to avoid infinite recursion when methods call each other */
  calledBy = {},

  /** Used to avoid hz of Infinity */
  divisors = {
    '1': 4096,
    '2': 512,
    '3': 64,
    '4': 8,
    '5': 0
  },

  /**
   * T-Distribution two-tailed critical values for 95% confidence
   * http://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm
   */
  distribution = {
    '1':  12.706,'2':  4.303, '3':  3.182, '4':  2.776, '5':  2.571, '6':  2.447,
    '7':  2.365, '8':  2.306, '9':  2.262, '10': 2.228, '11': 2.201, '12': 2.179,
    '13': 2.16,  '14': 2.145, '15': 2.131, '16': 2.12,  '17': 2.11,  '18': 2.101,
    '19': 2.093, '20': 2.086, '21': 2.08,  '22': 2.074, '23': 2.069, '24': 2.064,
    '25': 2.06,  '26': 2.056, '27': 2.052, '28': 2.048, '29': 2.045, '30': 2.042,
    'infinity': 1.96
  },

  /** Used to flag environments/features */
  has = {

    /** Detect Adobe AIR */
    'air': isClassOf(window.runtime, 'ScriptBridgingProxyObject'),

    /** Detect if `arguments` objects have the correct internal [[Class]] value */
    'argumentsClass': isClassOf(arguments, 'Arguments'),

    /** Detect if strings support accessing characters by index */
    'charByIndex':
      // IE8 supports indexes on string literals but not string objects
      Object('x')[0] == 'x',

    /** Detect if strings have indexes as own properties */
    'charByOwnIndex':
      // Narwhal, Rhino, RingoJS, and Opera < 10.52 support indexes on strings
      // but don't detect them as own properties
      hasKey('x', '0'),

    /** Detect if functions support decompilation */
    'decompilation': !!(function() {
      try{
        // Safari 2.x removes commas in object literals
        // from Function#toString results
        // http://webk.it/11609
        // Firefox 3.6 and Opera 9.25 strip grouping
        // parentheses from Function#toString results
        // http://bugzil.la/559438
        return Function(
          'return (' + (function(x) { return { 'x': '' + (1 + x) + '', 'y': 0 }; }) + ')'
        )()(0).x === '1';
      } catch(e) { }
    }()),

    /** Detect ES5+ property descriptor API */
    'descriptors' : !!(function() {
      try {
        var o = {};
        return (setDescriptor(o, o, o), 'value' in getDescriptor(o, o));
      } catch(e) { }
    }()),

    /** Detect ES5+ Object.getOwnPropertyNames() */
    'getAllKeys': !!(function() {
      try {
        return /\bvalueOf\b/.test(getAllKeys(Object.prototype));
      } catch(e) { }
    }()),

    /** Detect if Java is enabled/exposed */
    'java': isClassOf(window.java, 'JavaPackage'),

    /** Detect if the Timers API exists */
    'timeout': isHostType(window, 'setTimeout') && isHostType(window, 'clearTimeout')
  },

  /**
   * Timer utility object used by `clock()` and `Deferred#resolve`.
   * @private
   * @type Object
   */
  timer = {

   /**
    * The timer namespace object or constructor.
    * @private
    * @memberOf timer
    * @type Function|Object
    */
    'ns': Date,

   /**
    * Starts the deferred timer.
    * @private
    * @memberOf timer
    * @param {Object} deferred The deferred instance.
    */
    'start': null, // lazy defined in `clock()`

   /**
    * Stops the deferred timer.
    * @private
    * @memberOf timer
    * @param {Object} deferred The deferred instance.
    */
    'stop': null // lazy defined in `clock()`
  },

  /** Shortcut for inverse results */
  noArgumentsClass = !has.argumentsClass,
  noCharByIndex = !has.charByIndex,
  noCharByOwnIndex = !has.charByOwnIndex,

  /** Math shortcuts */
  abs   = Math.abs,
  floor = Math.floor,
  max   = Math.max,
  min   = Math.min,
  pow   = Math.pow,
  sqrt  = Math.sqrt;

  /*--------------------------------------------------------------------------*/

  /**
   * Benchmark constructor.
   * @constructor
   * @param {String} name A name to identify the benchmark.
   * @param {Function|String} fn The test to benchmark.
   * @param {Object} [options={}] Options object.
   * @example
   *
   * // basic usage (the `new` operator is optional)
   * var bench = new Benchmark(fn);
   *
   * // or using a name first
   * var bench = new Benchmark('foo', fn);
   *
   * // or with options
   * var bench = new Benchmark('foo', fn, {
   *
   *   // displayed by Benchmark#toString if `name` is not available
   *   'id': 'xyz',
   *
   *   // called when the benchmark starts running
   *   'onStart': onStart,
   *
   *   // called after each run cycle
   *   'onCycle': onCycle,
   *
   *   // called when aborted
   *   'onAbort': onAbort,
   *
   *   // called when a test errors
   *   'onError': onError,
   *
   *   // called when reset
   *   'onReset': onReset,
   *
   *   // called when the benchmark completes running
   *   'onComplete': onComplete,
   *
   *   // compiled/called before the test loop
   *   'setup': setup,
   *
   *   // compiled/called after the test loop
   *   'teardown': teardown
   * });
   *
   * // or name and options
   * var bench = new Benchmark('foo', {
   *
   *   // a flag to indicate the benchmark is deferred
   *   'deferred': true,
   *
   *   // benchmark test function
   *   'fn': function(deferred) {
   *     // call resolve() when the deferred test is finished
   *     deferred.resolve();
   *   }
   * });
   *
   * // or options only
   * var bench = new Benchmark({
   *
   *   // benchmark name
   *   'name': 'foo',
   *
   *   // benchmark test as a string
   *   'fn': '[1,2,3,4].sort()'
   * });
   *
   * // a test's `this` binding is set to the benchmark instance
   * var bench = new Benchmark('foo', function() {
   *   'My name is '.concat(this.name); // My name is foo
   * });
   */
  function Benchmark(name, fn, options) {
    var me = this;

    // allow instance creation without the `new` operator
    if (me && me.constructor != Benchmark) {
      return new Benchmark(name, fn, options);
    }
    // juggle arguments
    if (isClassOf(name, 'Object')) {
      // 1 argument (options)
      options = name;
    }
    else if (isClassOf(name, 'Function')) {
      // 2 arguments (fn, options)
      options = fn;
      fn = name;
    }
    else if (isClassOf(fn, 'Object')) {
      // 2 arguments (name, options)
      options = fn;
      fn = null;
      me.name = name;
    }
    else {
      // 3 arguments (name, fn [, options])
      me.name = name;
    }
    setOptions(me, options);
    me.id || (me.id = ++counter);
    me.fn == null && (me.fn = fn);
    me.stats = extend({}, me.stats);
    me.times = extend({}, me.times);
  }

  /**
   * Deferred constructor.
   * @constructor
   * @memberOf Benchmark
   * @param {Object} bench The benchmark instance.
   */
  function Deferred(bench) {
    var me = this;
    if (me && me.constructor != Deferred) {
      return new Deferred(bench);
    }
    me.benchmark = bench;
    clock(me);
  }

  /**
   * Event constructor.
   * @constructor
   * @memberOf Benchmark
   * @param {String|Object} type The event type.
   */
  function Event(type) {
    var me = this;
    return (me && me.constructor != Event)
      ? new Event(type)
      : (type instanceof Event)
          ? type
          : extend(me, typeof type == 'string' ? { 'type': type } : type);
  }

  /**
   * Suite constructor.
   * @constructor
   * @memberOf Benchmark
   * @param {String} name A name to identify the suite.
   * @param {Object} [options={}] Options object.
   * @example
   *
   * // basic usage (the `new` operator is optional)
   * var suite = new Benchmark.Suite;
   *
   * // or using a name first
   * var suite = new Benchmark.Suite('foo');
   *
   * // or with options
   * var suite = new Benchmark.Suite('foo', {
   *
   *   // called when the suite starts running
   *   'onStart': onStart,
   *
   *   // called between running benchmarks
   *   'onCycle': onCycle,
   *
   *   // called when aborted
   *   'onAbort': onAbort,
   *
   *   // called when a test errors
   *   'onError': onError,
   *
   *   // called when reset
   *   'onReset': onReset,
   *
   *   // called when the suite completes running
   *   'onComplete': onComplete
   * });
   */
  function Suite(name, options) {
    var me = this;

    // allow instance creation without the `new` operator
    if (me && me.constructor != Suite) {
      return new Suite(name, options);
    }
    // juggle arguments
    if (isClassOf(name, 'Object')) {
      // 1 argument (options)
      options = name;
    } else {
      // 2 arguments (name [, options])
      me.name = name;
    }
    setOptions(me, options);
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Note: Some array methods have been implemented in plain JavaScript to avoid
   * bugs in IE, Opera, Rhino, and Mobile Safari.
   *
   * IE compatibility mode and IE < 9 have buggy Array `shift()` and `splice()`
   * functions that fail to remove the last element, `object[0]`, of
   * array-like-objects even though the `length` property is set to `0`.
   * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
   * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
   *
   * In Opera < 9.50 and some older/beta Mobile Safari versions using `unshift()`
   * generically to augment the `arguments` object will pave the value at index 0
   * without incrimenting the other values's indexes.
   * https://github.com/documentcloud/underscore/issues/9
   *
   * Rhino and environments it powers, like Narwhal and RingoJS, may have
   * buggy Array `concat()`, `reverse()`, `shift()`, `slice()`, `splice()` and
   * `unshift()` functions that make sparse arrays non-sparse by assigning the
   * undefined indexes a value of undefined.
   * https://github.com/mozilla/rhino/commit/702abfed3f8ca043b2636efd31c14ba7552603dd
   */

  /**
   * Creates an array containing the elements of the host array followed by the
   * elements of each argument in order.
   * @memberOf Benchmark.Suite
   * @returns {Array} The new array.
   */
  function concat() {
    var value,
        j = -1,
        length = arguments.length,
        result = slice.call(this),
        index = result.length;

    while (++j < length) {
      value = arguments[j];
      if (isClassOf(value, 'Array')) {
        for (var k = 0, l = value.length; k < l; k++, index++) {
          if (k in value) {
            result[index] = value[k];
          }
        }
      } else {
        result[index] = value;
      }
    }
    return result;
  }

  /**
   * Utility function used by `shift()`, `splice()`, and `unshift()`.
   * @private
   * @param {Number} start The index to start inserting elements.
   * @param {Number} deleteCount The number of elements to delete from the insert point.
   * @param {Array} elements The elements to insert.
   * @returns {Array} An array of deleted elements.
   */
  function insert(start, deleteCount, elements) {
    var deleteEnd = start + deleteCount,
        elementCount = elements ? elements.length : 0,
        index = start - 1,
        length = start + elementCount,
        object = this,
        result = [],
        tail = slice.call(object, deleteEnd);

    // delete elements from the array
    while (++index < deleteEnd) {
      if (index in object) {
        result[index - start] = object[index];
        delete object[index];
      }
    }
    // insert elements
    index = start - 1;
    while (++index < length) {
      object[index] = elements[index - start];
    }
    // append tail elements
    start = index--;
    length = (object.length >>> 0) - deleteCount + elementCount;
    while (++index < length) {
      if ((index - start) in tail) {
        object[index] = tail[index - start];
      } else {
        delete object[index];
      }
    }
    // delete excess elements
    deleteCount = deleteCount > elementCount ? deleteCount - elementCount : 0;
    while (deleteCount--) {
      delete object[length + deleteCount];
    }
    object.length = length;
    return result;
  }

  /**
   * Rearrange the host array's elements in reverse order.
   * @memberOf Benchmark.Suite
   * @returns {Array} The reversed array.
   */
  function reverse() {
    var upperIndex,
        value,
        index = -1,
        object = Object(this),
        length = object.length >>> 0,
        middle = floor(length / 2);

    if (length > 1) {
      while (++index < middle) {
        upperIndex = length - index - 1;
        value = upperIndex in object ? object[upperIndex] : uid;
        if (index in object) {
          object[upperIndex] = object[index];
        } else {
          delete object[upperIndex];
        }
        if (value != uid) {
          object[index] = value;
        } else {
          delete object[index];
        }
      }
    }
    return object;
  }

  /**
   * Removes the first element of the host array and returns it.
   * @memberOf Benchmark.Suite
   * @returns {Mixed} The first element of the array.
   */
  function shift() {
    return insert.call(this, 0, 1)[0];
  }

  /**
   * Creates an array of the host array's elements from the start index up to,
   * but not including, the end index.
   * @memberOf Benchmark.Suite
   * @returns {Array} The new array.
   */
  function slice(start, end) {
    var index = -1,
        object = Object(this),
        length = object.length >>> 0,
        result = [];

    start = toInteger(start);
    start = start < 0 ? max(length + start, 0) : min(start, length);
    start--;
    end = end == null ? length : toInteger(end);
    end = end < 0 ? max(length + end, 0) : min(end, length);

    while ((++index, ++start) < end) {
      if (start in object) {
        result[index] = object[start];
      }
    }
    return result;
  }

  /**
   * Allows removing a range of elements and/or inserting elements into the host array.
   * @memberOf Benchmark.Suite
   * @returns {Array} An array of removed elements.
   */
  function splice(start, deleteCount) {
    var object = Object(this),
        length = object.length >>> 0;

    start = toInteger(start);
    start = start < 0 ? max(length + start, 0) : min(start, length);
    deleteCount = min(max(toInteger(deleteCount), 0), length - start);
    return insert.call(object, start, deleteCount, slice.call(arguments, 2));
  }

  /**
   * Converts the specified `value` to an integer.
   * @private
   * @param {Mixed} value The value to convert.
   * @returns {Number} The resulting integer.
   */
  function toInteger(value) {
    value = +value;
    return value === 0 || !isFinite(value) ? value || 0 : value - (value % 1);
  }

  /**
   * Appends arguments to the host array.
   * @memberOf Benchmark.Suite
   * @returns {Number} The new length.
   */
  function unshift() {
    var object = Object(this);
    insert.call(object, 0, 0, arguments);
    return object.length;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Executes a function, associated with a benchmark, synchronously or asynchronously.
   * @private
   * @param {Object} options The options object.
   */
  function call(options) {
    options || (options = {});
    var fn = options.fn;

    (!options.async && fn || function() {
      var bench = options.benchmark,
          ids = bench._timerIds || (bench._timerIds = []),
          index = ids.length;

      // under normal use there should only be one id at any time per benchmark
      ids.push(setTimeout(function() {
        ids.splice(index, 1);
        ids.length || delete bench._timerIds;
        fn();
      }, bench.delay * 1e3));
    })();
  }

  /**
   * Creates a function from the given arguments string and body.
   * @private
   * @param {String} args The comma separated function arguments.
   * @param {String} body The function body.
   * @returns {Function} The new function.
   */
  function createFunction() {
    // lazy defined to fork based on supported features
    createFunction = function(args, body) {
      var anchor = freeDefine ? define.amd : Benchmark,
          prop = uid + 'createFunction';

      runScript((freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '=function(' + args + '){' + body + '}');
      return [anchor[prop], delete anchor[prop]][0];
    };
    // fix JaegerMonkey bug
    // http://bugzil.la/639720
    createFunction = (createFunction('', 'return"' + uid + '"') || noop)() == uid ? createFunction : Function;
    return createFunction.apply(null, arguments);
  }

  /**
   * Iterates over an object's properties, executing the `callback` for each.
   * Callbacks may terminate the loop by explicitly returning `false`.
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   * @param {Object} options The options object.
   * @returns {Object} Returns the object iterated over.
   */
  function forProps() {
    var forShadowed,
        skipSeen,
        forArgs = true,
        shadowed = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

    (function(enumFlag, key) {
      // must use a non-native constructor to catch the Safari 2 issue
      function Klass() { this.valueOf = 0; };
      Klass.prototype.valueOf = 0;
      // check various for..in bugs
      for (key in new Klass) {
        enumFlag += key == 'valueOf' ? 1 : 0;
      }
      // check if `arguments` objects have non-enumerable indexes
      for (key in arguments) {
        key == '0' && (forArgs = false);
      }
      // Safari 2 iterates over shadowed properties twice
      // http://replay.waybackmachine.org/20090428222941/http://tobielangel.com/2007/1/29/for-in-loop-broken-in-safari/
      skipSeen = enumFlag == 2;
      // IE < 9 incorrectly makes an object's properties non-enumerable if they have
      // the same name as other non-enumerable properties in its prototype chain.
      forShadowed = !enumFlag;
    }(0));

    // lazy define
    forProps = function(object, callback, options) {
      options || (options = {});

      var ctor,
          key,
          keys,
          skipCtor,
          done = !object,
          result = [object, object = Object(object)][0],
          which = options.which,
          allFlag = which == 'all',
          fn = callback,
          index = -1,
          iteratee = object,
          length = object.length,
          ownFlag = allFlag || which == 'own',
          seen = {},
          skipProto = isClassOf(object, 'Function'),
          thisArg = options.bind;

      object = Object(object);

      if (thisArg !== undefined) {
        callback = function(value, key, object) {
          return fn.call(thisArg, value, key, object);
        };
      }
      // iterate all properties
      if (allFlag && has.getAllKeys) {
        for (index = 0, keys = getAllKeys(object), length = keys.length; index < length; index++) {
          key = keys[index];
          if (callback(object[key], key, object) === false) {
            break;
          }
        }
      }
      // else iterate only enumerable properties
      else {
        for (key in object) {
          // Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
          // (if the prototype or a property on the prototype has been set)
          // incorrectly set a function's `prototype` property [[Enumerable]] value
          // to `true`. Because of this we standardize on skipping the `prototype`
          // property of functions regardless of their [[Enumerable]] value.
          if ((done =
              !(skipProto && key == 'prototype') &&
              !(skipSeen && (hasKey(seen, key) || !(seen[key] = true))) &&
              (!ownFlag || ownFlag && hasKey(object, key)) &&
              callback(object[key], key, object) === false)) {
            break;
          }
        }
        // in IE < 9 strings don't support accessing characters by index
        if (!done && (
            forArgs && isArguments(object) ||
            (noCharByIndex || noCharByOwnIndex) && isClassOf(object, 'String'))) {
          noCharByIndex && (iteratee = object.split(''));
          while (++index < length) {
            if ((done =
                callback(iteratee[index], String(index), object) === false)) {
              break;
            }
          }
        }
        if (!done && forShadowed) {
          // Because IE < 9 can't set the `[[Enumerable]]` attribute of an existing
          // property and the `constructor` property of a prototype defaults to
          // non-enumerable, we manually skip the `constructor` property when we
          // think we are iterating over a `prototype` object.
          ctor = object.constructor;
          skipCtor = ctor && ctor.prototype && ctor.prototype.constructor === ctor;
          for (index = 0; index < 7; index++) {
            key = shadowed[index];
            if (!(skipCtor && key == 'constructor') &&
                hasKey(object, key) &&
                callback(object[key], key, object) === false) {
              break;
            }
          }
        }
      }
      return result;
    };
    return forProps.apply(null, arguments);
  }

  /**
   * Gets the critical value for the specified degrees of freedom.
   * @private
   * @param {Number} df The degrees of freedom.
   * @returns {Number} The critical value.
   */
  function getCriticalValue(df) {
    return distribution[Math.round(df) || 1] || distribution.infinity;
  }

  /**
   * Gets the name of the first argument from a function's source.
   * @private
   * @param {Function} fn The function.
   * @param {String} altName A string used when the name of the first argument is unretrievable.
   * @returns {String} The argument name.
   */
  function getFirstArgument(fn, altName) {
    return (!hasKey(fn, 'toString') &&
      (/^[\s(]*function[^(]*\(([^\s,)]+)/.exec(fn) || 0)[1]) || altName || '';
  }

  /**
   * Computes the arithmetic mean of a sample.
   * @private
   * @param {Array} sample The sample.
   * @returns {Number} The mean.
   */
  function getMean(sample) {
    return reduce(sample, function(sum, x) {
      return sum + x;
    }, 0) / sample.length || 0;
  }

  /**
   * Gets the source code of a function.
   * @private
   * @param {Function} fn The function.
   * @param {String} altSource A string used when a function's source code is unretrievable.
   * @returns {String} The function's source code.
   */
  function getSource(fn, altSource) {
    var result = altSource;
    if (isStringable(fn)) {
      result = String(fn);
    } else if (has.decompilation) {
      result = (/^[^{]+{([\s\S]*)}\s*$/.exec(fn) || 0)[1];
    }
    return (result || '').replace(/^\s+|\s+$/g, '');
  }

  /**
   * Modify a string by replacing named tokens with matching object property values.
   * @private
   * @param {String} string The string to modify.
   * @param {Object} object The template object.
   * @returns {String} The modified string.
   */
  function interpolate(string, object) {
    forOwn(object, function(value, key) {
      string = string.replace(RegExp('#\\{' + key + '\\}', 'g'), value);
    });
    return string;
  }

  /**
   * Checks if a value is an `arguments` object.
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the value is an `arguments` object, else `false`.
   */
  function isArguments() {
    // lazy define
    isArguments = function(value) {
      return toString.call(value) == '[object Arguments]';
    };
    if (noArgumentsClass) {
      isArguments = function(value) {
        return hasKey(value, 'callee') &&
          !(propertyIsEnumerable && propertyIsEnumerable.call(value, 'callee'));
      };
    }
    return isArguments(arguments[0]);
  }

  /**
   * Checks if an object is of the specified class.
   * @private
   * @param {Mixed} value The value to check.
   * @param {String} name The name of the class.
   * @returns {Boolean} Returns `true` if the value is of the specified class, else `false`.
   */
  function isClassOf(value, name) {
    return value != null && toString.call(value) == '[object ' + name + ']';
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of object, function, or unknown.
   * @private
   * @param {Mixed} object The owner of the property.
   * @param {String} property The property to check.
   * @returns {Boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Checks if the specified `value` is an object created by the `Object` constructor.
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if `value` is an object, else `false`.
   */
  function isObject(value) {
    var ctor,
        result = !!value && toString.call(value) == '[object Object]';

    if (result && noArgumentsClass) {
      // avoid false positives for `arguments` objects in IE < 9
      result = !isArguments(value);
    }
    if (result) {
      // IE < 9 presents nodes like `Object` objects:
      // IE < 8 are missing the node's constructor property
      // IE 8 node constructors are typeof "object"
      ctor = value.constructor;
      // check if the constructor is `Object` as `Object instanceof Object` is `true`
      if ((result = isClassOf(ctor, 'Function') && ctor instanceof ctor)) {
        // assume objects created by the `Object` constructor have no inherited enumerable properties
        // (we assume there are no `Object.prototype` extensions)
        forProps(value, function(subValue, subKey) {
          result = subKey;
        });
        // An object's own properties are iterated before inherited properties.
        // If the last iterated key belongs to an object's own property then
        // there are no inherited enumerable properties.
        result = result === true || hasKey(value, result);
      }
    }
    return result;
  }

  /**
   * Checks if a value can be safely coerced to a string.
   * @private
   * @param {Mixed} value The value to check.
   * @returns {Boolean} Returns `true` if the value can be coerced, else `false`.
   */
  function isStringable(value) {
    return hasKey(value, 'toString') || isClassOf(value, 'String');
  }

  /**
   * Wraps a function and passes `this` to the original function as the first argument.
   * @private
   * @param {Function} fn The function to be wrapped.
   * @returns {Function} The new function.
   */
  function methodize(fn) {
    return function() {
      var args = [this];
      args.push.apply(args, arguments);
      return fn.apply(null, args);
    };
  }

  /**
   * A no-operation function.
   * @private
   */
  function noop() {
    // no operation performed
  }

  /**
   * A wrapper around require() to suppress `module missing` errors.
   * @private
   * @param {String} id The module id.
   * @returns {Mixed} The exported module or `null`.
   */
  function req(id) {
    try {
      return freeExports && freeRequire(id);
    } catch(e) { }
    return null;
  }

  /**
   * Runs a snippet of JavaScript via script injection.
   * @private
   * @param {String} code The code to run.
   */
  function runScript(code) {
    var parent,
        script,
        sibling,
        anchor = freeDefine ? define.amd : Benchmark,
        prop = uid + 'runScript',
        prefix = '(' + (freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '||function(){})();';

    // Non-browser environments, Firefox 2.0.0.2 (executes asynchronously),
    // and IE < 9 will error here and that's OK.
    // Script injection is only used to avoid the previously commented JaegerMonkey bug.
    // We remove the inserted script *before* running the code to avoid differences
    // in the expected script element count/order of the document.
    try {
      sibling = document.getElementsByTagName('script')[0];
      parent = sibling.parentNode;
      script = document.createElement('script');
      anchor[prop] = function() { parent.removeChild(script); };
      script.appendChild(document.createTextNode(prefix + code));
      parent.insertBefore(script, sibling);
    } catch(e) { }

    delete anchor[prop];
  }

  /**
   * A helper function for setting options/event handlers.
   * @private
   * @param {Object} bench The benchmark instance.
   * @param {Object} [options={}] Options object.
   */
  function setOptions(bench, options) {
    options = extend({}, bench.constructor.options, options);
    bench.options = forOwn(options, function(value, key) {
      if (value != null) {
        // add event listeners
        if (/^on[A-Z]/.test(key)) {
          forEach(key.split(' '), function(key) {
            bench.on(key.slice(2).toLowerCase(), value);
          });
        } else {
          bench[key] = deepClone(value);
        }
      }
    });
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Handles cycling/completing the deferred benchmark.
   * @memberOf Benchmark.Deferred
   */
  function resolve() {
    var me = this,
        bench = me.benchmark;

    if (++me.cycles < bench.count) {
      (bench._host || bench).compiled.call(me, timer.ns, timer);
    } else {
      timer.stop(me);
      call({
        'async': true,
        'benchmark': bench,
        'fn': function() {
          cycle({ 'benchmark': bench, 'deferred': me });
        }
      });
    }
  }

  /*--------------------------------------------------------------------------*/

  /**
   * A deep clone utility.
   * @static
   * @memberOf Benchmark
   * @param {Mixed} value The value to clone.
   * @returns {Mixed} The cloned value.
   */
  function deepClone(value) {
    var accessor,
        circular,
        clone,
        ctor,
        data,
        descriptor,
        extensible,
        key,
        length,
        markerKey,
        parent,
        result,
        source,
        subIndex,
        index = -1,
        marked = [],
        unmarked = [],
        queue = { '0': { 'value': value }, 'length': 1 };

    /**
     * An easily detectable decorator for cloned values.
     */
    function Marker(object) {
      this.raw = object;
    }

    /**
     * Gets an available marker key for the given object.
     */
    function getMarkerKey(object) {
      // avoid collisions with existing keys
      var result = uid;
      while (object[result] && object[result].constructor != Marker) {
        result += 1;
      }
      return result;
    }

    /**
     * The callback used by `forProps()`.
     */
    function propCallback(subValue, subKey) {
      // exit early to avoid cloning the marker
      if (subValue && subValue.constructor == Marker) {
        return;
      }
      // add objects to the queue
      if (subValue === Object(subValue)) {
        queue[queue.length++] = { 'key': subKey, 'parent': clone, 'source': value };
      }
      // assign non-objects
      else {
        clone[subKey] = subValue;
      }
    }

    while ((data = queue[++index])) {
      key = data.key;
      parent = data.parent;
      source = data.source;
      clone = value = source ? source[key] : data.value;
      accessor = circular = descriptor = false;
      delete queue[index - 1];

      // create a basic clone to filter out functions, DOM elements, and
      // other non `Object` objects
      if (value === Object(value)) {
        ctor = value.constructor;
        switch (toString.call(value)) {
          case '[object Array]':
            clone = new ctor(value.length);
            break;

          case '[object Boolean]':
            clone = new ctor(value == true);
            break;

          case '[object Date]':
            clone = new ctor(+value);
            break;

          case '[object Object]':
            isObject(value) && (clone = new ctor);
            break;

          case '[object Number]':
          case '[object String]':
            clone = new ctor(value);
            break;

          case '[object RegExp]':
            clone = ctor(value.source,
              (value.global     ? 'g' : '') +
              (value.ignoreCase ? 'i' : '') +
              (value.multiline  ? 'm' : ''));
        }
        // continue clone if `value` doesn't have an accessor descriptor
        // http://es5.github.com/#x8.10.1
        if (clone != value &&
            !(descriptor = source && has.descriptors && getDescriptor(source, key),
              accessor = descriptor && (descriptor.get || descriptor.set))) {
          // use an existing clone (circular reference)
          if ((extensible = isExtensible(value))) {
            markerKey = getMarkerKey(value);
            if (value[markerKey]) {
              circular = clone = value[markerKey].raw;
            }
          } else {
            // for frozen/sealed objects
            for (subIndex = 0, length = unmarked.length; subIndex < length; subIndex++) {
              data = unmarked[subIndex];
              if (data.object === value) {
                circular = clone = data.clone;
                break;
              }
            }
          }
          if (!circular) {
            // mark object to allow quickly detecting circular references and tie it to its clone
            if (extensible) {
              value[markerKey] = new Marker(clone);
              marked.push({ 'key': markerKey, 'object': value });
            } else {
              // for frozen/sealed objects
              unmarked.push({ 'clone': clone, 'object': value });
            }
            // iterate over object properties
            forProps(value, propCallback, { 'which': 'all' });
          }
        }
      }
      if (parent) {
        // for custom property descriptors
        if (accessor || (descriptor &&
            !(descriptor.configurable && descriptor.enumerable && descriptor.writable))) {
          descriptor.value && (descriptor.value = clone);
          setDescriptor(parent, key, descriptor);
        }
        // for default property descriptors
        else {
          parent[key] = clone;
        }
      } else {
        result = clone;
      }
    }
    // remove markers
    for (index = 0, length = marked.length; index < length; index++) {
      data = marked[index];
      delete data.object[data.key];
    }
    return result;
  }

  /**
   * An iteration utility for arrays and objects.
   * Callbacks may terminate the loop by explicitly returning `false`.
   * @static
   * @memberOf Benchmark
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Object} thisArg The `this` binding for the callback function.
   * @returns {Array|Object} Returns the object iterated over.
   */
  function each(object, callback, thisArg) {
    var fn = callback,
        index = -1,
        result = [object, object = Object(object)][0],
        origObject = object,
        length = object.length,
        isSnapshot = !!(object.snapshotItem && (length = object.snapshotLength)),
        isSplittable = (noCharByIndex || noCharByOwnIndex) && isClassOf(object, 'String'),
        isConvertable = isSnapshot || isSplittable || 'item' in object;

    // in Opera < 10.5 `hasKey(object, 'length')` returns `false` for NodeLists
    if (length === length >>> 0) {
      if (isConvertable) {
        // the third argument of the callback is the original non-array object
        callback = function(value, index) {
          return fn.call(this, value, index, origObject);
        };
        // in IE < 9 strings don't support accessing characters by index
        if (isSplittable) {
          object = object.split('');
        } else {
          object = [];
          while (++index < length) {
            // in Safari 2 `index in object` is always `false` for NodeLists
            object[index] = isSnapshot ? result.snapshotItem(index) : result[index];
          }
        }
      }
      forEach(object, callback, thisArg);
    } else {
      forOwn(object, callback, thisArg);
    }
    return result;
  }

  /**
   * Copies own/inherited properties of a source object to the destination object.
   * @static
   * @memberOf Benchmark
   * @param {Object} destination The destination object.
   * @param {Object} [source={}] The source object.
   * @returns {Object} The destination object.
   */
  function extend(destination, source) {
    // Chrome < 14 incorrectly sets `destination` to `undefined` when we `delete arguments[0]`
    // http://code.google.com/p/v8/issues/detail?id=839
    destination = [destination, delete arguments[0]][0];
    forEach(arguments, function(source) {
      forProps(source, function(value, key) {
        destination[key] = value;
      });
    });
    return destination;
  }

  /**
   * A generic `Array#filter` like method.
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function|String} callback The function/alias called per iteration.
   * @param {Object} thisArg The `this` binding for the callback function.
   * @returns {Array} A new array of values that passed callback filter.
   * @example
   *
   * // get odd numbers
   * Benchmark.filter([1, 2, 3, 4, 5], function(n) {
   *   return n % 2;
   * }); // -> [1, 3, 5];
   *
   * // get fastest benchmarks
   * Benchmark.filter(benches, 'fastest');
   *
   * // get slowest benchmarks
   * Benchmark.filter(benches, 'slowest');
   *
   * // get benchmarks that completed without erroring
   * Benchmark.filter(benches, 'successful');
   */
  function filter(array, callback, thisArg) {
    var result;

    if (callback == 'successful') {
      // callback to exclude errored or unrun benchmarks
      callback = function(bench) { return bench.cycles; };
    }
    else if (callback == 'fastest' || callback == 'slowest') {
      // get successful, sort by period + margin of error, and filter fastest/slowest
      result = filter(array, 'successful').sort(function(a, b) {
        a = a.stats; b = b.stats;
        return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback == 'fastest' ? 1 : -1);
      });
      result = filter(result, function(bench) {
        return !result[0].compare(bench);
      });
    }
    return result || reduce(array, function(result, value, index) {
      return callback.call(thisArg, value, index, array) ? (result.push(value), result) : result;
    }, []);
  }

  /**
   * A generic `Array#forEach` like method.
   * Callbacks may terminate the loop by explicitly returning `false`.
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Object} thisArg The `this` binding for the callback function.
   * @returns {Array} Returns the array iterated over.
   */
  function forEach(array, callback, thisArg) {
    var fn = callback,
        index = -1,
        length = (array = Object(array)).length >>> 0;

    if (thisArg !== undefined) {
      callback = function(value, index, array) {
        return fn.call(thisArg, value, index, array);
      };
    }
    while (++index < length) {
      if (index in array &&
          callback(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   * Callbacks may terminate the loop by explicitly returning `false`.
   * @static
   * @memberOf Benchmark
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   * @param {Object} thisArg The `this` binding for the callback function.
   * @returns {Object} Returns the object iterated over.
   */
  function forOwn(object, callback, thisArg) {
    return forProps(object, callback, { 'bind': thisArg, 'which': 'own' });
  }

  /**
   * Converts a number to a more readable comma-separated string representation.
   * @static
   * @memberOf Benchmark
   * @param {Number} number The number to convert.
   * @returns {String} The more readable string representation.
   */
  function formatNumber(number) {
    number = String(number).split('.');
    return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') +
      (number[1] ? '.' + number[1] : '');
  }

  /**
   * Checks if an object has the specified key as a direct property.
   * @static
   * @memberOf Benchmark
   * @param {Object} object The object to check.
   * @param {String} key The key to check for.
   * @returns {Boolean} Returns `true` if key is a direct property, else `false`.
   */
  function hasKey() {
    // lazy define for worst case fallback (not as accurate)
    hasKey = function(object, key) {
      var parent = object != null && (object.constructor || Object).prototype;
      return !!parent && key in Object(object) && !(key in parent && object[key] === parent[key]);
    };
    // for modern browsers
    if (isClassOf(hasOwnProperty, 'Function')) {
      hasKey = function(object, key) {
        return object != null && hasOwnProperty.call(object, key);
      };
    }
    // for Safari 2
    else if ({}.__proto__ == Object.prototype) {
      hasKey = function(object, key) {
        var result = false;
        if (object != null) {
          object = Object(object);
          object.__proto__ = [object.__proto__, object.__proto__ = null, result = key in object][0];
        }
        return result;
      };
    }
    return hasKey.apply(this, arguments);
  }

  /**
   * A generic `Array#indexOf` like method.
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Mixed} value The value to search for.
   * @param {Number} [fromIndex=0] The index to start searching from.
   * @returns {Number} The index of the matched value or `-1`.
   */
  function indexOf(array, value, fromIndex) {
    var index = toInteger(fromIndex),
        length = (array = Object(array)).length >>> 0;

    index = (index < 0 ? max(0, length + index) : index) - 1;
    while (++index < length) {
      if (index in array && value === array[index]) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Invokes a method on all items in an array.
   * @static
   * @memberOf Benchmark
   * @param {Array} benches Array of benchmarks to iterate over.
   * @param {String|Object} name The name of the method to invoke OR options object.
   * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
   * @returns {Array} A new array of values returned from each method invoked.
   * @example
   *
   * // invoke `reset` on all benchmarks
   * Benchmark.invoke(benches, 'reset');
   *
   * // invoke `emit` with arguments
   * Benchmark.invoke(benches, 'emit', 'complete', listener);
   *
   * // invoke `run(true)`, treat benchmarks as a queue, and register invoke callbacks
   * Benchmark.invoke(benches, {
   *
   *   // invoke the `run` method
   *   'name': 'run',
   *
   *   // pass a single argument
   *   'args': true,
   *
   *   // treat as queue, removing benchmarks from front of `benches` until empty
   *   'queued': true,
   *
   *   // called before any benchmarks have been invoked.
   *   'onStart': onStart,
   *
   *   // called between invoking benchmarks
   *   'onCycle': onCycle,
   *
   *   // called after all benchmarks have been invoked.
   *   'onComplete': onComplete
   * });
   */
  function invoke(benches, name) {
    var args,
        bench,
        queued,
        index = -1,
        options = { 'onStart': noop, 'onCycle': noop, 'onComplete': noop },
        result = map(benches, function(bench) { return bench; });

    /**
     * Checks if invoking `run` with asynchronous cycles.
     */
    function isAsync(object) {
      var async = args[0] && args[0].async;
      return isRun(object) && (async == null ? object.options.async : async) && has.timeout;
    }

    /**
     * Checks if invoking `run` on a benchmark instance.
     */
    function isRun(object) {
      // avoid using `instanceof` here because of IE memory leak issues with host objects
      return Object(object).constructor == Benchmark && name == 'run';
    }

    /**
     * Checks if invoking `run` with synchronous cycles.
     */
    function isSync(object) {
      // if not asynchronous or deferred
      return !isAsync(object) && !(isRun(object) && object.defer);
    }

    /**
     * Executes the method and if synchronous, fetches the next bench.
     */
    function execute() {
      var listeners,
          sync = isSync(bench);

      if (!sync) {
        // use `getNext` as a listener
        bench.on('complete', getNext);
        listeners = bench.events.complete;
        listeners.splice(0, 0, listeners.pop());
      }
      // execute method
      result[index] = isClassOf(bench && bench[name], 'Function') ? bench[name].apply(bench, args) : undefined;
      // if synchronous return true until finished
      return sync && getNext();
    }

    /**
     * Fetches the next bench or executes `onComplete` callback.
     */
    function getNext() {
      var last = bench,
          sync = isSync(last);

      if (!sync) {
        last.removeListener('complete', getNext);
        last.emit('complete');
      }
      // choose next benchmark if not exiting early
      if (options.onCycle.call(benches, Event('cycle'), last) !== false && raiseIndex() !== false) {
        bench = queued ? benches[0] : result[index];
        if (!isSync(bench)) {
          call({ 'async': isAsync(bench), 'benchmark': bench, 'fn': execute });
        }
        else if (!sync) {
          // resume synchronous execution
          while (execute()) { }
        }
        else {
          // continue synchronous execution
          return true;
        }
      } else {
        options.onComplete.call(benches, Event('complete'), last);
      }
      // when async the `return false` will cancel the rest of the "complete"
      // listeners because they were called above and when synchronous it will
      // exit the while-loop
      return false;
    }

    /**
     * Raises `index` to the next defined index or returns `false`.
     */
    function raiseIndex() {
      var length = result.length;
      // if queued then remove the previous bench and subsequent skipped non-entries
      if (queued) {
        do {
          ++index > 0 && shift.call(benches);
        } while ((length = benches.length) && !('0' in benches));
      }
      else {
        while (++index < length && !(index in result)) { }
      }
      // if we reached the last index then return `false`
      return (queued ? length : index < length) ? index : (index = false);
    }

    // juggle arguments
    if (isClassOf(name, 'String')) {
      // 2 arguments (array, name)
      args = slice.call(arguments, 2);
    } else {
      // 2 arguments (array, options)
      options = extend(options, name);
      name = options.name;
      args = isClassOf(args = 'args' in options ? options.args : [], 'Array') ? args : [args];
      queued = options.queued;
    }
    // start iterating over the array
    if (raiseIndex() !== false) {
      bench = result[index];
      options.onStart.call(benches, Event('start'), bench);

      // end early if the suite was aborted in an "onStart" listener
      if (benches.aborted && benches.constructor == Suite && name == 'run') {
        options.onCycle.call(benches, Event('cycle'), bench);
        options.onComplete.call(benches, Event('complete'), bench);
      }
      // else start
      else {
        if (isAsync(bench)) {
          call({ 'async': true, 'benchmark': bench, 'fn': execute });
        } else {
          while (execute()) { }
        }
      }
    }
    return result;
  }

  /**
   * Creates a string of joined array values or object key-value pairs.
   * @static
   * @memberOf Benchmark
   * @param {Array|Object} object The object to operate on.
   * @param {String} [separator1=','] The separator used between key-value pairs.
   * @param {String} [separator2=': '] The separator used between keys and values.
   * @returns {String} The joined result.
   */
  function join(object, separator1, separator2) {
    var result = [],
        length = (object = Object(object)).length,
        arrayLike = length === length >>> 0;

    separator2 || (separator2 = ': ');
    each(object, function(value, key) {
      result.push(arrayLike ? value : key + separator2 + value);
    });
    return result.join(separator1 || ',');
  }

  /**
   * A generic `Array#map` like method.
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Object} thisArg The `this` binding for the callback function.
   * @returns {Array} A new array of values returned by the callback.
   */
  function map(array, callback, thisArg) {
    return reduce(array, function(result, value, index) {
      result[index] = callback.call(thisArg, value, index, array);
      return result;
    }, Array(Object(array).length >>> 0));
  }

  /**
   * Retrieves the value of a specified property from all items in an array.
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {String} property The property to pluck.
   * @returns {Array} A new array of property values.
   */
  function pluck(array, property) {
    return map(array, function(object) {
      return object == null ? undefined : object[property];
    });
  }

  /**
   * A generic `Array#reduce` like method.
   * @static
   * @memberOf Benchmark
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @param {Mixed} accumulator Initial value of the accumulator.
   * @returns {Mixed} The accumulator.
   */
  function reduce(array, callback, accumulator) {
    var noaccum = arguments.length < 3;
    forEach(array, function(value, index) {
      accumulator = noaccum ? (noaccum = 0, value) : callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Aborts all benchmarks in the suite.
   * @name abort
   * @memberOf Benchmark.Suite
   * @returns {Object} The suite instance.
   */
  function abortSuite() {
    var me = this;

    if (me.running) {
      calledBy.abortSuite = true;
      me.reset();
      delete calledBy.abortSuite;

      me.aborted = true;
      !calledBy.resetSuite && invoke(me, 'abort');
      me.emit('abort');
    }
    return me;
  }

  /**
   * Adds a test to the benchmark suite.
   * @memberOf Benchmark.Suite
   * @param {String} name A name to identify the benchmark.
   * @param {Function|String} fn The test to benchmark.
   * @param {Object} [options={}] Options object.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // basic usage
   * suite.add(fn);
   *
   * // or using a name first
   * suite.add('foo', fn);
   *
   * // or with options
   * suite.add('foo', fn, {
   *   'onCycle': onCycle,
   *   'onComplete': onComplete
   * });
   */
  function add(name, fn, options) {
    var me = this,
        bench = Benchmark(name, fn, options);

    me.push(bench);
    me.emit('add', bench);
    return me;
  }

  /**
   * Creates a new suite with cloned benchmarks.
   * @name clone
   * @memberOf Benchmark.Suite
   * @param {Object} options Options object to overwrite cloned options.
   * @returns {Object} The new suite instance.
   */
  function cloneSuite(options) {
    var me = this,
        result = new me.constructor(extend({}, me.options, options));

    // copy own properties
    forOwn(me, function(value, key) {
      if (!hasKey(result, key)) {
        result[key] = value && isClassOf(value.clone, 'Function') ? value.clone() : deepClone(value);
      }
    });
    return result;
  }

  /**
   * An `Array#filter` like method.
   * @name filter
   * @memberOf Benchmark.Suite
   * @param {Function|String} callback The function/alias called per iteration.
   * @returns {Object} A new suite of benchmarks that passed callback filter.
   */
  function filterSuite(callback) {
    var me = this,
        result = new me.constructor;

    result.push.apply(result, filter(me, callback));
    return result;
  }

  /**
   * Resets all benchmarks in the suite.
   * @name reset
   * @memberOf Benchmark.Suite
   * @returns {Object} The suite instance.
   */
  function resetSuite() {
    var me = this,
        notAborting = !calledBy.abortSuite;

    if (me.running && notAborting) {
      calledBy.resetSuite = true;
      me.abort();
      delete calledBy.resetSuite;
      me.aborted = false;
    }
    else if (me.aborted !== false || me.running !== false) {
      me.aborted = me.running = false;
      notAborting && invoke(me, 'reset');
      me.emit('reset');
    }
    return me;
  }

  /**
   * Runs the suite.
   * @name run
   * @memberOf Benchmark.Suite
   * @param {Object} [options={}] Options object.
   * @returns {Object} The suite instance.
   * @example
   *
   * // basic usage
   * suite.run();
   *
   * // or with options
   * suite.run({ 'async': true, 'queued': true });
   */
  function runSuite(options) {
    var me = this,
        benches = [];

    me.reset();
    me.running = true;
    options || (options = {});

    invoke(me, {
      'name': 'run',
      'args': options,
      'queued': options.queued,
      'onStart': function(event, bench) {
        me.emit('start', bench);
      },
      'onCycle': function(event, bench) {
        if (bench.error) {
          me.emit('error', bench);
        } else if (bench.cycles) {
          benches.push(bench);
        }
        return !me.aborted && me.emit('cycle', bench);
      },
      'onComplete': function(event, bench) {
        me.running = false;
        me.emit('complete', bench);
      }
    });
    return me;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Registers a single listener for the specified event type(s).
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} type The event type.
   * @param {Function} listener The function called when the event occurs.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // register a listener for an event type
   * bench.addListener('cycle', listener);
   *
   * // register a listener for multiple event types
   * bench.addListener('start cycle', listener);
   */
  function addListener(type, listener) {
    var me = this,
        events = me.events || (me.events = {});

    forEach(type.split(' '), function(type) {
      (events[type] || (events[type] = [])).push(listener);
    });
    return me;
  }

  /**
   * Executes all registered listeners of the specified event type.
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String|Object} type The event type or object.
   * @returns {Boolean} Returns `true` if all listeners were executed, else `false`.
   */
  function emit(type) {
    var me = this,
        event = Event(type),
        args = (arguments[0] = event, arguments),
        events = me.events,
        listeners = events && events[event.type] || [],
        result = true;

    forEach(listeners.slice(), function(listener) {
      return (result = listener.apply(me, args) !== false);
    });
    return result;
  }

  /**
   * Unregisters a single listener for the specified event type(s).
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} type The event type.
   * @param {Function} listener The function to unregister.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // unregister a listener for an event type
   * bench.removeListener('cycle', listener);
   *
   * // unregister a listener for multiple event types
   * bench.removeListener('start cycle', listener);
   */
  function removeListener(type, listener) {
    var me = this,
        events = me.events;

    forEach(type.split(' '), function(type) {
      var listeners = events && events[type] || [],
          index = indexOf(listeners, listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    });
    return me;
  }

  /**
   * Unregisters all listeners or those for the specified event type(s).
   * @memberOf Benchmark, Benchmark.Suite
   * @param {String} type The event type.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // unregister all listeners
   * bench.removeAllListeners();
   *
   * // unregister all listeners for an event type
   * bench.removeAllListeners('cycle');
   *
   * // unregister all listeners for multiple event types
   * bench.removeAllListeners('start cycle complete');
   */
  function removeAllListeners(type) {
    var me = this,
        events = me.events;

    forEach(type ? type.split(' ') : events, function(type) {
      (events && events[type] || []).length = 0;
    });
    return me;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Aborts the benchmark without recording times.
   * @memberOf Benchmark
   * @returns {Object} The benchmark instance.
   */
  function abort() {
    var me = this;

    if (me.running) {
      if (has.timeout) {
        forEach(me._timerIds || [], clearTimeout);
        delete me._timerIds;
      }
      // avoid infinite recursion
      calledBy.abort = true;
      me.reset();
      delete calledBy.abort;

      me.aborted = true;
      me.emit('abort');
    }
    return me;
  }

  /**
   * Creates a new benchmark using the same test and options.
   * @memberOf Benchmark
   * @param {Object} options Options object to overwrite cloned options.
   * @returns {Object} The new benchmark instance.
   * @example
   *
   * var bizarro = bench.clone({
   *   'name': 'doppelganger'
   * });
   */
  function clone(options) {
    var me = this,
        result = new me.constructor(extend({}, me, options));

    // correct the `options` object
    result.options = extend({}, me.options, options);

    // copy own custom properties
    forOwn(me, function(value, key) {
      if (!hasKey(result, key)) {
        result[key] = deepClone(value);
      }
    });
    return result;
  }

  /**
   * Determines if a benchmark is faster than another.
   * @memberOf Benchmark
   * @param {Object} other The benchmark to compare.
   * @returns {Number} Returns `-1` if slower, `1` if faster, and `0` if indeterminate.
   */
  function compare(other) {
    // unpaired two-sample t-test assuming equal variance
    // http://en.wikipedia.org/wiki/Student's_t-test
    // http://www.chem.utoronto.ca/coursenotes/analsci/StatsTutorial/12tailed.html
    var a = this.stats,
        b = other.stats,
        df = a.size + b.size - 2,
        pooled = (((a.size - 1) * a.variance) + ((b.size - 1) * b.variance)) / df,
        tstat = (a.mean - b.mean) / sqrt(pooled * (1 / a.size + 1 / b.size)),
        near = abs(1 - a.mean / b.mean) < 0.055 && a.rme < 3 && b.rme < 3;

    // check if the means aren't close and the t-statistic is significant
    // (a larger `mean` indicates a slower benchmark)
    return !near && abs(tstat) > getCriticalValue(df) ? (tstat > 0 ? -1 : 1) : 0;
  }

  /**
   * Reset properties and abort if running.
   * @memberOf Benchmark
   * @returns {Object} The benchmark instance.
   */
  function reset() {
    var changed,
        pair,
        me = this,
        source = extend({}, me.constructor.prototype, me.options),
        pairs = [[source, me]];

    if (me.running && !calledBy.abort) {
      // no worries, `reset()` is called within `abort()`
      me.abort();
      me.aborted = source.aborted;
    }
    else {
      // a non-recursive solution to check if properties have changed
      // http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4
      while ((pair = pairs.pop())) {
        forOwn(pair[0], function(value, key) {
          var other = pair[1][key];
          if (value && isClassOf(value, 'Object')) {
            pairs.push([value, other]);
          }
          else if (value !== other && !(value == null || isClassOf(value, 'Function'))) {
            pair[1][key] = value;
            changed = true;
          }
        });
      }
      if (changed) {
        me.emit('reset');
      }
    }
    return me;
  }

  /**
   * Displays relevant benchmark information when coerced to a string.
   * @name toString
   * @memberOf Benchmark
   * @returns {String} A string representation of the benchmark instance.
   */
  function toStringBench() {
    var me = this,
        error = me.error,
        hz = me.hz,
        id = me.id,
        stats = me.stats,
        size = stats.size,
        pm = has.java ? '+/-' : '\xb1',
        result = me.name || (typeof id == 'number' ? '<Test #' + id + '>' : id);

    if (error) {
      result += ': ' + join(error);
    } else {
      result += ' x ' + formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + ' ops/sec ' + pm +
        stats.rme.toFixed(2) + '% (' + size + ' run' + (size == 1 ? '' : 's') + ' sampled)';
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Clocks the time taken to execute a test per cycle (secs).
   * @private
   * @param {Object} bench The benchmark instance.
   * @returns {Number} The time taken.
   */
  function clock() {
    var applet,
        options = Benchmark.options,
        template = { 'begin': 's$=new n$', 'end': 'r$=(new n$-s$)/1e3', 'uid': uid },
        timers = [{ 'ns': timer.ns, 'res': max(0.0015, getRes('ms')), 'unit': 'ms' }];

    // lazy defined for hi-res timers
    clock = function(bench) {
      var deferred = bench instanceof Deferred && [bench, bench = bench.benchmark][0],
          host = bench._host || bench,
          fn = host.fn,
          fnArg = deferred ? getFirstArgument(fn, 'deferred') : '',
          stringable = isStringable(fn),
          decompilable = has.decompilation || stringable,
          source = {
            'setup': getSource(host.setup, preprocess('m$.setup()')),
            'fn': getSource(fn, preprocess('f$(' + fnArg + ')')),
            'fnArg': fnArg,
            'teardown': getSource(host.teardown, preprocess('m$.teardown()'))
          },
          compiled = fn.compiled,
          count = host.count = bench.count,
          id = host.id,
          isEmpty = !(source.fn || stringable),
          name = host.name || (typeof id == 'number' ? '<Test #' + id + '>' : id),
          ns = timer.ns,
          result = 0;

      // init `minTime` if needed
      bench.minTime = host.minTime || (host.minTime = host.options.minTime = options.minTime);

      // repair nanosecond timer
      // (some Chrome builds erase the `ns` variable after millions of executions)
      if (applet) {
        try {
          ns.nanoTime();
        } catch(e) {
          // use non-element to avoid issues with libs that augment them
          ns = timer.ns = new applet.Packages.nano;
        }
      }

      if(!compiled) {
        // compile in setup/teardown functions and the test loop
        compiled = host.compiled = createFunction(preprocess('n$,t$'), interpolate(
          preprocess(deferred
            ? 'var d$=this,#{fnArg}=d$,r$=d$.resolve,m$=(m$=d$.benchmark)._host||m$,f$=m$.fn;' +
              'if(!d$.cycles){d$.resolve=function(){d$.resolve=r$;r$.call(d$);' +
              'if(d$.cycles==m$.count){#{teardown}\n}};#{setup}\nt$.start(d$);}#{fn}\nreturn{}'
            : 'var r$,s$,m$=this,f$=m$.fn,i$=m$.count;#{setup}\n#{begin};' +
              'while(i$--){#{fn}\n}#{end};#{teardown}\nreturn{time:r$,uid:"#{uid}"}'),
          source
        ));

        try {
          if (isEmpty) {
            // Firefox may remove dead code from Function#toString results
            // http://bugzil.la/536085
            throw new Error('The test, ' + name + ', is empty. This may be the result of dead code removal.');
          }
          else if (!deferred) {
            // pretest to determine if compiled code is exits early, usually by a
            // rogue `return` statement, by checking for a return object with the uid
            host.count = 1;
            compiled = (compiled.call(host, ns) || {}).uid == uid && compiled;
            host.count = count;
          }
        } catch(e) {
          compiled = false;
          bench.error = e || new Error(String(e));
          host.count = count;
        }
        // fallback when a test exits early or errors during pretest
        if (decompilable && !compiled && !deferred && !isEmpty) {
          compiled = createFunction(preprocess('n$'), interpolate(
            preprocess((bench.error && !stringable
              ? 'var r$,s$,m$=this,f$=m$.fn,i$=m$.count;'
              : 'function f$(){#{fn}\n}var r$,s$,i$=this.count;'
            ) + '#{setup}\n#{begin};while(i$--){f$()}#{end};#{teardown}\nreturn{time:r$}'),
            source
          ));

          try {
            // pretest one more time to check for errors
            host.count = 1;
            compiled.call(host, ns);
            host.compiled = compiled;
            host.count = count;
            delete bench.error;
          }
          catch(e) {
            host.count = count;
            if (!bench.error) {
              host.compiled = compiled;
              bench.error = e || new Error(String(e));
            }
          }
        }
      }
      // if no errors run the full test loop
      if (!bench.error) {
        result = compiled.call(deferred || host, ns, timer).time;
      }
      return result;
    };

    /*------------------------------------------------------------------------*/

    /**
     * Gets the current timer's minimum resolution (secs).
     */
    function getRes(unit) {
      var measured,
          begin,
          count = 30,
          divisor = 1e3,
          ns = timer.ns,
          sample = [];

      // get average smallest measurable time
      while (count--) {
        if (unit == 'us') {
          divisor = 1e6;
          if (ns.stop) {
            ns.start();
            while (!(measured = ns.microseconds())) { }
          } else {
            begin = timer.ns();
            while (!(measured = ns() - begin)) { }
          }
        }
        else if (unit == 'ns') {
          divisor = 1e9;
          begin = ns.nanoTime();
          while (!(measured = ns.nanoTime() - begin)) { }
        }
        else {
          begin = new ns;
          while (!(measured = new ns - begin)) { }
        }
        // check for broken timers (nanoTime may have issues)
        // http://alivebutsleepy.srnet.cz/unreliable-system-nanotime/
        if (measured > 0) {
          sample.push(measured);
        } else {
          sample.push(Infinity);
          break;
        }
      }
      // convert to seconds
      return getMean(sample) / divisor;
    }

    /**
     * Replaces all occurrences of `$` with a unique number and
     * template tokens with content.
     */
    function preprocess(code) {
      return interpolate(code, template).replace(/\$/g, /\d+/.exec(uid));
    }

    /*------------------------------------------------------------------------*/

    // detect nanosecond support from a Java applet
    each(window.document && document.applets || [], function(element) {
      return !(timer.ns = applet = 'nanoTime' in element && element);
    });

    // check type in case Safari returns an object instead of a number
    try {
      if (typeof timer.ns.nanoTime() == 'number') {
        timers.push({ 'ns': timer.ns, 'res': getRes('ns'), 'unit': 'ns' });
      }
    } catch(e) { }

    // detect Chrome's microsecond timer:
    // enable benchmarking via the --enable-benchmarking command
    // line switch in at least Chrome 7 to use chrome.Interval
    try {
      if ((timer.ns = new (window.chrome || window.chromium).Interval)) {
        timers.push({ 'ns': timer.ns, 'res': getRes('us'), 'unit': 'us' });
      }
    } catch(e) { }

    // detect Node's microtime module:
    // npm install microtime
    if ((timer.ns = (req('microtime') || { 'now': 0 }).now)) {
      timers.push({ 'ns': timer.ns,  'res': getRes('us'), 'unit': 'us' });
    }

    // pick timer with highest resolution
    timer = reduce(timers, function(timer, other) {
      return other.res < timer.res ? other : timer;
    });

    // remove unused applet
    if (timer.unit != 'ns' && applet) {
      applet = (applet.parentNode.removeChild(applet), null);
    }
    // error if there are no working timers
    if (timer.res == Infinity) {
      throw new Error('Benchmark.js was unable to find a working timer.');
    }
    // use API of chosen timer
    if (timer.unit == 'ns') {
      extend(template, {
        'begin': 's$=n$.nanoTime()',
        'end': 'r$=(n$.nanoTime()-s$)/1e9'
      });
    }
    else if (timer.unit == 'us') {
      extend(template, timer.ns.stop ? {
        'begin': 's$=n$.start()',
        'end': 'r$=n$.microseconds()/1e6'
      } : {
        'begin': 's$=n$()',
        'end': 'r$=(n$()-s$)/1e6'
      });
    }

    // define `timer` methods
    timer.start = createFunction(preprocess('d$'),
      preprocess('var n$=this.ns,#{begin};d$.timeStamp=s$'));

    timer.stop = createFunction(preprocess('d$'),
      preprocess('var n$=this.ns,s$=d$.timeStamp,#{end};d$.elapsed=r$'));

    // resolve time span required to achieve a percent uncertainty of at most 1%
    // http://spiff.rit.edu/classes/phys273/uncert/uncert.html
    options.minTime || (options.minTime = max(timer.res / 2 / 0.01, 0.05));
    return clock.apply(null, arguments);
  }

  /**
   * Computes stats on benchmark results.
   * @private
   * @param {Object} options The options object.
   */
  function compute(options) {
    options || (options = {});

    var async = options.async,
        bench = options.benchmark,
        elapsed = 0,
        queue = [],
        sample = [],
        initCount = bench.initCount;

    /**
     * Adds a number of clones to the queue.
     */
    function enqueue(count) {
      while (count--) {
        queue.push(bench.clone({
          '_host': bench,
          'events': { 'start': [update], 'cycle': [update] }
        }));
      }
    }

    /**
     * Updates the clone/host benchmarks to keep their data in sync.
     */
    function update(event) {
      var clone = this,
          cycles = clone.cycles,
          type = event.type;

      if (bench.running) {
        if (type == 'cycle') {
          if (clone.error) {
            bench.abort();
            bench.error = clone.error;
            bench.emit('error');
          }
          else {
            // Note: the host's bench.count prop is updated in `clock()`
            bench.hz = clone.hz;
            bench.initCount = clone.initCount;
            bench.times.period = clone.times.period;
            if (cycles > bench.cycles) {
              bench.cycles = cycles;
            }
          }
          bench.emit(type);
        }
        else {
          // reached in clone's onStart
          // Note: clone.minTime prop is inited in `clock()`
          clone.count = bench.initCount;
        }
      } else if (bench.aborted) {
        clone.abort();
      }
    }

    /**
     * Determines if more clones should be queued or if cycling should stop.
     */
    function evaluate(event, clone) {
      var mean,
          moe,
          rme,
          sd,
          sem,
          variance,
          now = +new Date,
          times = bench.times,
          done = bench.aborted,
          maxedOut = (elapsed += now - clone.times.timeStamp) / 1e3 > bench.maxTime,
          size = sample.push(clone.times.period),
          varOf = function(sum, x) { return sum + pow(x - mean, 2); };

      // exit early for aborted or unclockable tests
      if (done || clone.hz == Infinity) {
        maxedOut = !(size = sample.length = queue.length = 0);
      }
      // set host values
      if (!done) {
        // sample mean (estimate of the population mean)
        mean = getMean(sample);
        // sample variance (estimate of the population variance)
        variance = reduce(sample, varOf, 0) / (size - 1) || 0;
        // sample standard deviation (estimate of the population standard deviation)
        sd = sqrt(variance);
        // standard error of the mean (aka the standard deviation of the sampling distribution of the sample mean)
        sem = sd / sqrt(size);
        // margin of error
        moe = sem * getCriticalValue(size - 1);
        // relative margin of error
        rme = (moe / mean) * 100 || 0;

        extend(bench.stats, {
          'moe': moe,
          'rme': rme,
          'sem': sem,
          'deviation': sd,
          'mean': mean,
          'size': size,
          'variance': variance
        });

        // We exit early when the elapsed time exceeds the maximum time allowed
        // per benchmark. To prevent massive wait times, we do this even if the
        // minimum sample size has not been reached. We don't count cycle delays
        // toward the max time because delays may be increased by browsers that
        // clamp timeouts in inactive tabs.
        // https://developer.mozilla.org/en/window.setTimeout#Inactive_tabs
        if (maxedOut) {
          done = true;
          bench.running = false;
          bench.initCount = initCount;
          times.elapsed = (now - times.timeStamp) / 1e3;
        }
        if (bench.hz != Infinity) {
          times.period = mean;
          times.cycle = mean * bench.count;
          bench.hz = 1 / mean;
        }
      }
      // if time permits, increase sample size to reduce the margin of error
      if (queue.length < 2 && !maxedOut) {
        enqueue(1);
      }
      // stop the invoke cycle when done
      return !done;
    }

    // init queue and begin
    enqueue(bench.minSamples);
    invoke(queue, {
      'name': 'run',
      'args': { 'async': async },
      'queued': true,
      'onCycle': evaluate,
      'onComplete': function() {
        bench.emit('complete');
      }
    });
  }

  /**
   * Cycles a benchmark until a run `count` can be established.
   * @private
   * @param {Object} options The options object.
   */
  function cycle(options) {
    options || (options = {});

    var clocked,
        divisor,
        minTime,
        period,
        async = options.async,
        bench = options.benchmark,
        count = bench.count,
        deferred = options.deferred,
        times = bench.times;

    // continue, if not aborted between cycles
    if (bench.running) {
      // host `minTime` is set to `Benchmark.options.minTime` in `clock()`
      bench.cycles++;
      clocked = deferred ? deferred.elapsed : clock(bench);
      minTime = bench.minTime;

      if (bench.error) {
        bench.abort();
        bench.emit('error');
      }
    }
    // continue, if not errored
    if (bench.running) {
      // time taken to complete last test cycle
      times.cycle = clocked;
      // seconds per operation
      period = times.period = clocked / count;
      // ops per second
      bench.hz = 1 / period;
      // do we need to do another cycle?
      bench.running = clocked < minTime;
      // avoid working our way up to this next time
      bench.initCount = count;

      if (bench.running) {
        // tests may clock at `0` when `initCount` is a small number,
        // to avoid that we set its count to something a bit higher
        if (!clocked && (divisor = divisors[bench.cycles]) != null) {
          count = floor(4e6 / divisor);
        }
        // calculate how many more iterations it will take to achive the `minTime`
        if (count <= bench.count) {
          count += Math.ceil((minTime - clocked) / period);
        }
        bench.running = count != Infinity;
      }
    }
    // should we exit early?
    if (bench.emit('cycle') === false) {
      bench.abort();
    }
    // figure out what to do next
    if (bench.running) {
      bench.count = count;
      if (deferred) {
        (bench._host || bench).compiled.call(deferred, timer.ns, timer);
      } else {
        call({
          'async': async,
          'benchmark': bench,
          'fn': function() {
            cycle({ 'async': async, 'benchmark': bench });
          }
        });
      }
    } else {
      // fix TraceMonkey bug associated with clock fallbacks
      // http://bugzil.la/509069
      runScript('try{' + uid + '=1;delete ' + uid + '}catch(e){}');
      // done
      bench.emit('complete');
    }
  }

  /**
   * Runs the benchmark.
   * @memberOf Benchmark
   * @param {Object} [options={}] Options object.
   * @returns {Object} The benchmark instance.
   * @example
   *
   * // basic usage
   * bench.run();
   *
   * // or with options
   * bench.run({ 'async': true });
   */
  function run(options) {
    var me = this,
        async = ((async = options && options.async) == null ? me.async : async) && has.timeout;

    // set running to false so reset() won't call abort()
    me.running = false;
    me.reset();
    me.running = true;

    me.count = me.initCount;
    me.times.timeStamp = +new Date;
    me.emit('start');

    if (me._host) {
      if (me.defer) {
        Deferred(me);
      } else {
        cycle({ 'async': async, 'benchmark': me });
      }
    } else {
      compute({ 'async': async, 'benchmark': me });
    }
    return me;
  }

  /*--------------------------------------------------------------------------*/

  extend(Benchmark, {

    /**
     * The version number.
     * @static
     * @memberOf Benchmark
     * @type String
     */
    'version': '0.3.0',

    /**
     * The default options copied by benchmark instances.
     * @static
     * @memberOf Benchmark
     * @type Object
     */
    'options': {

      /**
       * A flag to indicate that benchmark cycles will execute asynchronously by default.
       * @memberOf Benchmark.options
       * @type Boolean
       */
      'async': false,

      /**
       * A flag to indicate that the benchmark clock is deferred.
       * @memberOf Benchmark.options
       * @type Boolean
       */
      'defer': false,

      /**
       * The delay between test cycles (secs).
       * @memberOf Benchmark.options
       * @type Number
       */
      'delay': 0.005,

      /**
       * Displayed by Benchmark#toString when a `name` is not available (auto-generated if `null`).
       * @memberOf Benchmark.options
       * @type String|Null
       */
      'id': null,

      /**
       * The default number of times to execute a test on a benchmark's first cycle.
       * @memberOf Benchmark.options
       * @type Number
       */
      'initCount': 1,

      /**
       * The maximum time a benchmark is allowed to run before finishing (secs).
       * Note: Cycle delays aren't counted toward the maximum time.
       * @memberOf Benchmark.options
       * @type Number
       */
      'maxTime': 5,

      /**
       * The minimum sample size required to perform statistical analysis.
       * @memberOf Benchmark.options
       * @type Number
       */
      'minSamples': 5,

      /**
       * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
       * @memberOf Benchmark.options
       * @type Number
       */
      'minTime': 0,

      /**
       * The name of the benchmark.
       * @memberOf Benchmark.options
       * @type String|Null
       */
      'name': null
    },

    /**
     * Platform object with properties describing things like browser name,
     * version, and operating system.
     * @static
     * @memberOf Benchmark
     * @type Object
     */
    'platform': req('platform') || window.platform || {

      /**
       * The platform description.
       * @memberOf Benchmark.platform
       * @type String
       */
      'description': window.navigator && navigator.userAgent || null,

      /**
       * The name of the browser layout engine.
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'layout': null,

      /**
       * The name of the product hosting the browser.
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'product': null,

      /**
       * The name of the browser/environment.
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'name': null,

      /**
       * The name of the product's manufacturer.
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'manufacturer': null,

      /**
       * The name of the operating system.
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'os': null,

      /**
       * The alpha/beta release indicator.
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'prerelease': null,

      /**
       * The browser/environment version.
       * @memberOf Benchmark.platform
       * @type String|Null
       */
      'version': null,

      /**
       * Return platform description when the platform object is coerced to a string.
       * @memberOf Benchmark.platform
       * @type Function
       * @returns {String} The platform description.
       */
      'toString': function() {
        return this.description || '';
      }
    },

    // clone objects
    'deepClone': deepClone,

    // iteration utility
    'each': each,

    // augment objects
    'extend': extend,

    // generic Array#filter
    'filter': filter,

    // generic Array#forEach
    'forEach': forEach,

    // generic own property iteration utility
    'forOwn': forOwn,

    // converts a number to a comma-separated string
    'formatNumber': formatNumber,

    // generic Object#hasOwnProperty
    // (trigger hasKey's lazy define before assigning it to Benchmark)
    'hasKey': (hasKey(Benchmark, ''), hasKey),

    // generic Array#indexOf
    'indexOf': indexOf,

    // invokes a method on each item in an array
    'invoke': invoke,

    // generic Array#join for arrays and objects
    'join': join,

    // generic Array#map
    'map': map,

    // retrieves a property value from each item in an array
    'pluck': pluck,

    // generic Array#reduce
    'reduce': reduce
  });

  /*--------------------------------------------------------------------------*/

  extend(Benchmark.prototype, {

    /**
     * The number of times a test was executed.
     * @memberOf Benchmark
     * @type Number
     */
    'count': 0,

    /**
     * The number of cycles performed while benchmarking.
     * @memberOf Benchmark
     * @type Number
     */
    'cycles': 0,

    /**
     * The number of executions per second.
     * @memberOf Benchmark
     * @type Number
     */
    'hz': 0,

    /**
     * The compiled test function.
     * @memberOf Benchmark
     * @type Function|String
     */
    'compiled': null,

    /**
     * The error object if the test failed.
     * @memberOf Benchmark
     * @type Object|Null
     */
    'error': null,

    /**
     * The test to benchmark.
     * @memberOf Benchmark
     * @type Function|String
     */
    'fn': null,

    /**
     * A flag to indicate if the benchmark is aborted.
     * @memberOf Benchmark
     * @type Boolean
     */
    'aborted': false,

    /**
     * A flag to indicate if the benchmark is running.
     * @memberOf Benchmark
     * @type Boolean
     */
    'running': false,

    /**
     * Alias of [`Benchmark#addListener`](#Benchmark:addListener).
     * @memberOf Benchmark, Benchmark.Suite
     * @type Function
     */
    'on': addListener,

    /**
     * Compiled into the test and executed immediately **before** the test loop.
     * @memberOf Benchmark
     * @type Function|String
     * @example
     *
     * // basic usage
     * var bench = Benchmark({
     *   'setup': function() {
     *     var c = this.count,
     *         element = document.getElementById('container');
     *     while (c--) {
     *       element.appendChild(document.createElement('div'));
     *     }
     *   },
     *   'fn': function() {
     *     element.removeChild(element.lastChild);
     *   }
     * });
     *
     * // compiles to something like:
     * var c = this.count,
     *     element = document.getElementById('container');
     * while (c--) {
     *   element.appendChild(document.createElement('div'));
     * }
     * var start = new Date;
     * while (count--) {
     *   element.removeChild(element.lastChild);
     * }
     * var end = new Date - start;
     *
     * // or using strings
     * var bench = Benchmark({
     *   'setup': '\
     *     var a = 0;\n\
     *     (function() {\n\
     *       (function() {\n\
     *         (function() {',
     *   'fn': 'a += 1;',
     *   'teardown': '\
     *          }())\n\
     *        }())\n\
     *      }())'
     * });
     *
     * // compiles to something like:
     * var a = 0;
     * (function() {
     *   (function() {
     *     (function() {
     *       var start = new Date;
     *       while (count--) {
     *         a += 1;
     *       }
     *       var end = new Date - start;
     *     }())
     *   }())
     * }())
     */
    'setup': noop,

    /**
     * Compiled into the test and executed immediately **after** the test loop.
     * @memberOf Benchmark
     * @type Function|String
     */
    'teardown': noop,

    /**
     * An object of stats including mean, margin or error, and standard deviation.
     * @memberOf Benchmark
     * @type Object
     */
    'stats': {

      /**
       * The margin of error.
       * @memberOf Benchmark#stats
       * @type Number
       */
      'moe': 0,

      /**
       * The relative margin of error (expressed as a percentage of the mean).
       * @memberOf Benchmark#stats
       * @type Number
       */
      'rme': 0,

      /**
       * The standard error of the mean.
       * @memberOf Benchmark#stats
       * @type Number
       */
      'sem': 0,

      /**
       * The sample standard deviation.
       * @memberOf Benchmark#stats
       * @type Number
       */
      'deviation': 0,

      /**
       * The sample arithmetic mean.
       * @memberOf Benchmark#stats
       * @type Number
       */
      'mean': 0,

      /**
       * The sample size.
       * @memberOf Benchmark#stats
       * @type Number
       */
      'size': 0,

      /**
       * The sample variance.
       * @memberOf Benchmark#stats
       * @type Number
       */
      'variance': 0
    },

    /**
     * An object of timing data including cycle, elapsed, period, start, and stop.
     * @memberOf Benchmark
     * @type Object
     */
    'times': {

      /**
       * The time taken to complete the last cycle (secs).
       * @memberOf Benchmark#times
       * @type Number
       */
      'cycle': 0,

      /**
       * The time taken to complete the benchmark (secs).
       * @memberOf Benchmark#times
       * @type Number
       */
      'elapsed': 0,

      /**
       * The time taken to execute the test once (secs).
       * @memberOf Benchmark#times
       * @type Number
       */
      'period': 0,

      /**
       * A timestamp of when the benchmark started (ms).
       * @memberOf Benchmark#times
       * @type Number
       */
      'timeStamp': 0
    },

    // aborts benchmark (does not record times)
    'abort': abort,

    // registers a single listener
    'addListener': addListener,

    // creates a new benchmark using the same test and options
    'clone': clone,

    // compares benchmark's hertz with another
    'compare': compare,

    // executes listeners of a specified type
    'emit': emit,

    // removes all listeners of a specified type
    'removeAllListeners': removeAllListeners,

    // removes a single listener
    'removeListener': removeListener,

    // reset benchmark properties
    'reset': reset,

    // runs the benchmark
    'run': run,

    // pretty print benchmark info
    'toString': toStringBench
  });

  /*--------------------------------------------------------------------------*/

  /**
   * The default options copied by suite instances.
   * @static
   * @memberOf Benchmark.Suite
   * @type Object
   */
  Suite.options = {

    /**
     * The name of the suite.
     * @memberOf Benchmark.Suite.options
     * @type String|Null
     */
    'name': null
  };

  /*--------------------------------------------------------------------------*/

  extend(Suite.prototype, {

    /**
     * The number of benchmarks in the suite.
     * @memberOf Benchmark.Suite
     * @type Number
     */
    'length': 0,

    /**
     * A flag to indicate if the suite is aborted.
     * @memberOf Benchmark.Suite
     * @type Boolean
     */
    'aborted': false,

    /**
     * A flag to indicate if the suite is running.
     * @memberOf Benchmark.Suite
     * @type Boolean
     */
    'running': false,

    /**
     * An `Array#forEach` like method.
     * Callbacks may terminate the loop by explicitly returning `false`.
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @returns {Object} The suite iterated over.
     */
    'forEach': methodize(forEach),

    /**
     * An `Array#indexOf` like method.
     * @memberOf Benchmark.Suite
     * @param {Mixed} value The value to search for.
     * @returns {Number} The index of the matched value or `-1`.
     */
    'indexOf': methodize(indexOf),

    /**
     * Invokes a method on all benchmarks in the suite.
     * @memberOf Benchmark.Suite
     * @param {String|Object} name The name of the method to invoke OR options object.
     * @param {Mixed} [arg1, arg2, ...] Arguments to invoke the method with.
     * @returns {Array} A new array of values returned from each method invoked.
     */
    'invoke': methodize(invoke),

    /**
     * Converts the array to a string.
     * @memberOf Benchmark.Suite
     * @param {String} [separator=','] A string to separate each element of the array.
     * @returns {String} The removed element.
     */
    'join': [].join,

    /**
     * An `Array#map` like method.
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @returns {Array} A new array of values returned by the callback.
     */
    'map': methodize(map),

    /**
     * Retrieves the value of a specified property from all benchmarks in the suite.
     * @memberOf Benchmark.Suite
     * @param {String} property The property to pluck.
     * @returns {Array} A new array of property values.
     */
    'pluck': methodize(pluck),

    /**
     * Removes the last element of the host array and returns it.
     * @memberOf Benchmark.Suite
     * @returns {Mixed} The removed element.
     */
    'pop': [].pop,

    /**
     * Appends arguments to the end of the array.
     * @memberOf Benchmark.Suite
     * @returns {Number} The array length.
     */
    'push': [].push,

    /**
     * Sorts the elements of the host array.
     * @memberOf Benchmark.Suite
     * @param {Function} [compareFn=null] A function that defines the sort order.
     * @returns {Array} The sorted host array.
     */
    'sort': [].sort,

    /**
     * An `Array#reduce` like method.
     * @memberOf Benchmark.Suite
     * @param {Function} callback The function called per iteration.
     * @param {Mixed} accumulator Initial value of the accumulator.
     * @returns {Mixed} The accumulator.
     */
    'reduce': methodize(reduce),

    // aborts all benchmarks in the suite
    'abort': abortSuite,

    // adds a benchmark to the suite
    'add': add,

    // registers a single listener
    'addListener': addListener,

    // creates a new suite with cloned benchmarks
    'clone': cloneSuite,

    // executes listeners of a specified type
    'emit': emit,

    // creates a new suite of filtered benchmarks
    'filter': filterSuite,

    // alias of addListener
    'on': addListener,

    // removes all listeners of a specified type
    'removeAllListeners': removeAllListeners,

    // removes a single listener
    'removeListener': removeListener,

    // resets all benchmarks in the suite
    'reset': resetSuite,

    // runs all benchmarks in the suite
    'run': runSuite,

    // array methods
    'concat': concat,

    'reverse': reverse,

    'shift': shift,

    'slice': slice,

    'splice': splice,

    'unshift': unshift
  });

  /*--------------------------------------------------------------------------*/

  extend(Deferred.prototype, {

    /**
     * The deferred benchmark instance.
     * @memberOf Benchmark.Deferred
     * @type Object
     */
    'benchmark': null,

    /**
     * The number of deferred cycles performed while benchmarking.
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'cycles': 0,

    /**
     * The time taken to complete the deferred benchmark (secs).
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'elapsed': 0,

    /**
     * A timestamp of when the deferred benchmark started (ms).
     * @memberOf Benchmark.Deferred
     * @type Number
     */
    'timeStamp': 0,

    // cycles/completes the deferred benchmark
    'resolve': resolve
  });

  /*--------------------------------------------------------------------------*/

  /**
   * The event type.
   * @memberOf Benchmark.Event
   * @type String
   */
  Event.prototype.type = '';

  /*--------------------------------------------------------------------------*/

  // expose Deferred, Event and Suite
  extend(Benchmark, {
    'Deferred': Deferred,
    'Event': Event,
    'Suite': Suite
  });

  // expose Benchmark
  if (freeExports) {
    // in Node.js or RingoJS v0.8.0+
    if (typeof module == 'object' && module && module.exports == freeExports) {
      (module.exports = Benchmark).Benchmark = Benchmark;
    }
    // in Narwhal or RingoJS v0.7.0-
    else {
      freeExports.Benchmark = Benchmark;
    }
  }
  // via curl.js or RequireJS
  else if (freeDefine) {
    define('benchmark', function() {
      return Benchmark;
    });
  }
  // in a browser or Rhino
  else {
    // use square bracket notation so Closure Compiler won't munge `Benchmark`
    // http://code.google.com/closure/compiler/docs/api-tutorial3.html#export
    window['Benchmark'] = Benchmark;
  }

  // trigger clock's lazy define early to avoid a security error
  if (has.air) {
    clock({ 'fn': noop, 'count': 1, 'options': {} });
  }
}(this));