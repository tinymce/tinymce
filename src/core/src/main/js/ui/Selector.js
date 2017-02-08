/**
 * Selector.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-nested-ternary:0 */

/**
 * Selector engine, enables you to select controls by using CSS like expressions.
 * We currently only support basic CSS expressions to reduce the size of the core
 * and the ones we support should be enough for most cases.
 *
 * @example
 * Supported expressions:
 *  element
 *  element#name
 *  element.class
 *  element[attr]
 *  element[attr*=value]
 *  element[attr~=value]
 *  element[attr!=value]
 *  element[attr^=value]
 *  element[attr$=value]
 *  element:<state>
 *  element:not(<expression>)
 *  element:first
 *  element:last
 *  element:odd
 *  element:even
 *  element element
 *  element > element
 *
 * @class tinymce.ui.Selector
 */
define(
  'tinymce.core.ui.Selector',
  [
    "tinymce.core.util.Class"
  ],
  function (Class) {
    "use strict";

    /**
     * Produces an array with a unique set of objects. It will not compare the values
     * but the references of the objects.
     *
     * @private
     * @method unqiue
     * @param {Array} array Array to make into an array with unique items.
     * @return {Array} Array with unique items.
     */
    function unique(array) {
      var uniqueItems = [], i = array.length, item;

      while (i--) {
        item = array[i];

        if (!item.__checked) {
          uniqueItems.push(item);
          item.__checked = 1;
        }
      }

      i = uniqueItems.length;
      while (i--) {
        delete uniqueItems[i].__checked;
      }

      return uniqueItems;
    }

    var expression = /^([\w\\*]+)?(?:#([\w\-\\]+))?(?:\.([\w\\\.]+))?(?:\[\@?([\w\\]+)([\^\$\*!~]?=)([\w\\]+)\])?(?:\:(.+))?/i;

    /*jshint maxlen:255 */
    /*eslint max-len:0 */
    var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
      whiteSpace = /^\s*|\s*$/g,
      Collection;

    var Selector = Class.extend({
      /**
       * Constructs a new Selector instance.
       *
       * @constructor
       * @method init
       * @param {String} selector CSS like selector expression.
       */
      init: function (selector) {
        var match = this.match;

        function compileNameFilter(name) {
          if (name) {
            name = name.toLowerCase();

            return function (item) {
              return name === '*' || item.type === name;
            };
          }
        }

        function compileIdFilter(id) {
          if (id) {
            return function (item) {
              return item._name === id;
            };
          }
        }

        function compileClassesFilter(classes) {
          if (classes) {
            classes = classes.split('.');

            return function (item) {
              var i = classes.length;

              while (i--) {
                if (!item.classes.contains(classes[i])) {
                  return false;
                }
              }

              return true;
            };
          }
        }

        function compileAttrFilter(name, cmp, check) {
          if (name) {
            return function (item) {
              var value = item[name] ? item[name]() : '';

              return !cmp ? !!check :
                cmp === "=" ? value === check :
                  cmp === "*=" ? value.indexOf(check) >= 0 :
                    cmp === "~=" ? (" " + value + " ").indexOf(" " + check + " ") >= 0 :
                      cmp === "!=" ? value != check :
                        cmp === "^=" ? value.indexOf(check) === 0 :
                          cmp === "$=" ? value.substr(value.length - check.length) === check :
                            false;
            };
          }
        }

        function compilePsuedoFilter(name) {
          var notSelectors;

          if (name) {
            name = /(?:not\((.+)\))|(.+)/i.exec(name);

            if (!name[1]) {
              name = name[2];

              return function (item, index, length) {
                return name === 'first' ? index === 0 :
                  name === 'last' ? index === length - 1 :
                    name === 'even' ? index % 2 === 0 :
                      name === 'odd' ? index % 2 === 1 :
                        item[name] ? item[name]() :
                          false;
              };
            }

            // Compile not expression
            notSelectors = parseChunks(name[1], []);

            return function (item) {
              return !match(item, notSelectors);
            };
          }
        }

        function compile(selector, filters, direct) {
          var parts;

          function add(filter) {
            if (filter) {
              filters.push(filter);
            }
          }

          // Parse expression into parts
          parts = expression.exec(selector.replace(whiteSpace, ''));

          add(compileNameFilter(parts[1]));
          add(compileIdFilter(parts[2]));
          add(compileClassesFilter(parts[3]));
          add(compileAttrFilter(parts[4], parts[5], parts[6]));
          add(compilePsuedoFilter(parts[7]));

          // Mark the filter with pseudo for performance
          filters.pseudo = !!parts[7];
          filters.direct = direct;

          return filters;
        }

        // Parser logic based on Sizzle by John Resig
        function parseChunks(selector, selectors) {
          var parts = [], extra, matches, i;

          do {
            chunker.exec("");
            matches = chunker.exec(selector);

            if (matches) {
              selector = matches[3];
              parts.push(matches[1]);

              if (matches[2]) {
                extra = matches[3];
                break;
              }
            }
          } while (matches);

          if (extra) {
            parseChunks(extra, selectors);
          }

          selector = [];
          for (i = 0; i < parts.length; i++) {
            if (parts[i] != '>') {
              selector.push(compile(parts[i], [], parts[i - 1] === '>'));
            }
          }

          selectors.push(selector);

          return selectors;
        }

        this._selectors = parseChunks(selector, []);
      },

      /**
       * Returns true/false if the selector matches the specified control.
       *
       * @method match
       * @param {tinymce.ui.Control} control Control to match against the selector.
       * @param {Array} selectors Optional array of selectors, mostly used internally.
       * @return {Boolean} true/false state if the control matches or not.
       */
      match: function (control, selectors) {
        var i, l, si, sl, selector, fi, fl, filters, index, length, siblings, count, item;

        selectors = selectors || this._selectors;
        for (i = 0, l = selectors.length; i < l; i++) {
          selector = selectors[i];
          sl = selector.length;
          item = control;
          count = 0;

          for (si = sl - 1; si >= 0; si--) {
            filters = selector[si];

            while (item) {
              // Find the index and length since a pseudo filter like :first needs it
              if (filters.pseudo) {
                siblings = item.parent().items();
                index = length = siblings.length;
                while (index--) {
                  if (siblings[index] === item) {
                    break;
                  }
                }
              }

              for (fi = 0, fl = filters.length; fi < fl; fi++) {
                if (!filters[fi](item, index, length)) {
                  fi = fl + 1;
                  break;
                }
              }

              if (fi === fl) {
                count++;
                break;
              } else {
                // If it didn't match the right most expression then
                // break since it's no point looking at the parents
                if (si === sl - 1) {
                  break;
                }
              }

              item = item.parent();
            }
          }

          // If we found all selectors then return true otherwise continue looking
          if (count === sl) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns a tinymce.ui.Collection with matches of the specified selector inside the specified container.
       *
       * @method find
       * @param {tinymce.ui.Control} container Container to look for items in.
       * @return {tinymce.ui.Collection} Collection with matched elements.
       */
      find: function (container) {
        var matches = [], i, l, selectors = this._selectors;

        function collect(items, selector, index) {
          var i, l, fi, fl, item, filters = selector[index];

          for (i = 0, l = items.length; i < l; i++) {
            item = items[i];

            // Run each filter against the item
            for (fi = 0, fl = filters.length; fi < fl; fi++) {
              if (!filters[fi](item, i, l)) {
                fi = fl + 1;
                break;
              }
            }

            // All filters matched the item
            if (fi === fl) {
              // Matched item is on the last expression like: panel toolbar [button]
              if (index == selector.length - 1) {
                matches.push(item);
              } else {
                // Collect next expression type
                if (item.items) {
                  collect(item.items(), selector, index + 1);
                }
              }
            } else if (filters.direct) {
              return;
            }

            // Collect child items
            if (item.items) {
              collect(item.items(), selector, index);
            }
          }
        }

        if (container.items) {
          for (i = 0, l = selectors.length; i < l; i++) {
            collect(container.items(), selectors[i], 0);
          }

          // Unique the matches if needed
          if (l > 1) {
            matches = unique(matches);
          }
        }

        // Fix for circular reference
        if (!Collection) {
          // TODO: Fix me!
          Collection = Selector.Collection;
        }

        return new Collection(matches);
      }
    });

    return Selector;
  }
);
