/**
 * JqueryIntegration.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Jquery integration plugin.
 *
 * @class tinymce.core.JqueryIntegration
 * @private
 */
define(
  'tinymce.core.JqueryIntegration',
  [
    'global!document',
    'global!window'
  ],
  function (document, window) {
    return function (global) {
      var undef, lazyLoading, patchApplied;
      var delayedInits = [], $, win;

      win = global ? global : window;
      $ = win.jQuery;

      var getTinymce = function () {
        // Reference to tinymce needs to be lazily evaluated since tinymce
        // might be loaded through the compressor or other means
        return win.tinymce;
      };

      $.fn.tinymce = function (settings) {
        var self = this, url, base, lang, suffix = "";

        // No match then just ignore the call
        if (!self.length) {
          return self;
        }

        // Get editor instance
        if (!settings) {
          return getTinymce() ? getTinymce().get(self[0].id) : null;
        }

        self.css('visibility', 'hidden'); // Hide textarea to avoid flicker

        var init = function () {
          var editors = [], initCount = 0;

          // Apply patches to the jQuery object, only once
          if (!patchApplied) {
            applyPatch();
            patchApplied = true;
          }

          // Create an editor instance for each matched node
          self.each(function (i, node) {
            var ed, id = node.id, oninit = settings.oninit;

            // Generate unique id for target element if needed
            if (!id) {
              node.id = id = getTinymce().DOM.uniqueId();
            }

            // Only init the editor once
            if (getTinymce().get(id)) {
              return;
            }

            // Create editor instance and render it
            ed = getTinymce().createEditor(id, settings);
            editors.push(ed);

            ed.on('init', function () {
              var scope, func = oninit;

              self.css('visibility', '');

              // Run this if the oninit setting is defined
              // this logic will fire the oninit callback ones each
              // matched editor instance is initialized
              if (oninit) {
                // Fire the oninit event ones each editor instance is initialized
                if (++initCount == editors.length) {
                  if (typeof func === "string") {
                    scope = (func.indexOf(".") === -1) ? null : getTinymce().resolve(func.replace(/\.\w+$/, ""));
                    func = getTinymce().resolve(func);
                  }

                  // Call the oninit function with the object
                  func.apply(scope || getTinymce(), editors);
                }
              }
            });
          });

          // Render the editor instances in a separate loop since we
          // need to have the full editors array used in the onInit calls
          $.each(editors, function (i, ed) {
            ed.render();
          });
        };

        // Load TinyMCE on demand, if we need to
        if (!win.tinymce && !lazyLoading && (url = settings.script_url)) {
          lazyLoading = 1;
          base = url.substring(0, url.lastIndexOf("/"));

          // Check if it's a dev/src version they want to load then
          // make sure that all plugins, themes etc are loaded in source mode as well
          if (url.indexOf('.min') != -1) {
            suffix = ".min";
          }

          // Setup tinyMCEPreInit object this will later be used by the TinyMCE
          // core script to locate other resources like CSS files, dialogs etc
          // You can also predefined a tinyMCEPreInit object and then it will use that instead
          win.tinymce = win.tinyMCEPreInit || {
            base: base,
            suffix: suffix
          };

          // url contains gzip then we assume it's a compressor
          if (url.indexOf('gzip') != -1) {
            lang = settings.language || "en";
            url = url + (/\?/.test(url) ? '&' : '?') + "js=true&core=true&suffix=" + escape(suffix) +
              "&themes=" + escape(settings.theme || 'modern') + "&plugins=" +
              escape(settings.plugins || '') + "&languages=" + (lang || '');

            // Check if compressor script is already loaded otherwise setup a basic one
            if (!win.tinyMCE_GZ) {
              win.tinyMCE_GZ = {
                start: function () {
                  var load = function (url) {
                    getTinymce().ScriptLoader.markDone(getTinymce().baseURI.toAbsolute(url));
                  };

                  // Add core languages
                  load("langs/" + lang + ".js");

                  // Add themes with languages
                  load("themes/" + settings.theme + "/theme" + suffix + ".js");
                  load("themes/" + settings.theme + "/langs/" + lang + ".js");

                  // Add plugins with languages
                  $.each(settings.plugins.split(","), function (i, name) {
                    if (name) {
                      load("plugins/" + name + "/plugin" + suffix + ".js");
                      load("plugins/" + name + "/langs/" + lang + ".js");
                    }
                  });
                },

                end: function () {
                }
              };
            }
          }

          var script = document.createElement('script');
          script.type = 'text/javascript';
          script.onload = script.onreadystatechange = function (e) {
            e = e || window.event;

            if (lazyLoading !== 2 && (e.type == 'load' || /complete|loaded/.test(script.readyState))) {
              getTinymce().dom.Event.domLoaded = 1;
              lazyLoading = 2;

              // Execute callback after mainscript has been loaded and before the initialization occurs
              if (settings.script_loaded) {
                settings.script_loaded();
              }

              init();

              $.each(delayedInits, function (i, init) {
                init();
              });
            }
          };
          script.src = url;
          document.body.appendChild(script);
        } else {
          // Delay the init call until tinymce is loaded
          if (lazyLoading === 1) {
            delayedInits.push(init);
          } else {
            init();
          }
        }

        return self;
      };

      // Add :tinymce pseudo selector this will select elements that has been converted into editor instances
      // it's now possible to use things like $('*:tinymce') to get all TinyMCE bound elements.
      $.extend($.expr[":"], {
        tinymce: function (e) {
          var editor;

          if (e.id && "tinymce" in win) {
            editor = getTinymce().get(e.id);

            if (editor && editor.editorManager === getTinymce()) {
              return true;
            }
          }

          return false;
        }
      });

      // This function patches internal jQuery functions so that if
      // you for example remove an div element containing an editor it's
      // automatically destroyed by the TinyMCE API
      var applyPatch = function () {
        // Removes any child editor instances by looking for editor wrapper elements
        var removeEditors = function (name) {
          // If the function is remove
          if (name === "remove") {
            this.each(function (i, node) {
              var ed = tinyMCEInstance(node);

              if (ed) {
                ed.remove();
              }
            });
          }

          this.find("span.mceEditor,div.mceEditor").each(function (i, node) {
            var ed = getTinymce().get(node.id.replace(/_parent$/, ""));

            if (ed) {
              ed.remove();
            }
          });
        };

        // Loads or saves contents from/to textarea if the value
        // argument is defined it will set the TinyMCE internal contents
        var loadOrSave = function (value) {
          var self = this, ed;

          // Handle set value
          /*jshint eqnull:true */
          if (value != null) {
            removeEditors.call(self);

            // Saves the contents before get/set value of textarea/div
            self.each(function (i, node) {
              var ed;

              if ((ed = getTinymce().get(node.id))) {
                ed.setContent(value);
              }
            });
          } else if (self.length > 0) {
            // Handle get value
            if ((ed = getTinymce().get(self[0].id))) {
              return ed.getContent();
            }
          }
        };

        // Returns tinymce instance for the specified element or null if it wasn't found
        var tinyMCEInstance = function (element) {
          var ed = null;

          if (element && element.id && win.tinymce) {
            ed = getTinymce().get(element.id);
          }

          return ed;
        };

        // Checks if the specified set contains tinymce instances
        var containsTinyMCE = function (matchedSet) {
          return !!((matchedSet) && (matchedSet.length) && (win.tinymce) && (matchedSet.is(":tinymce")));
        };

        // Patch various jQuery functions
        var jQueryFn = {};

        // Patch some setter/getter functions these will
        // now be able to set/get the contents of editor instances for
        // example $('#editorid').html('Content'); will update the TinyMCE iframe instance
        $.each(["text", "html", "val"], function (i, name) {
          var origFn = jQueryFn[name] = $.fn[name],
            textProc = (name === "text");

          $.fn[name] = function (value) {
            var self = this;

            if (!containsTinyMCE(self)) {
              return origFn.apply(self, arguments);
            }

            if (value !== undef) {
              loadOrSave.call(self.filter(":tinymce"), value);
              origFn.apply(self.not(":tinymce"), arguments);

              return self; // return original set for chaining
            }

            var ret = "";
            var args = arguments;

            (textProc ? self : self.eq(0)).each(function (i, node) {
              var ed = tinyMCEInstance(node);

              if (ed) {
                ret += textProc ? ed.getContent().replace(/<(?:"[^"]*"|'[^']*'|[^'">])*>/g, "") : ed.getContent({ save: true });
              } else {
                ret += origFn.apply($(node), args);
              }
            });

            return ret;
          };
        });

        // Makes it possible to use $('#id').append("content"); to append contents to the TinyMCE editor iframe
        $.each(["append", "prepend"], function (i, name) {
          var origFn = jQueryFn[name] = $.fn[name],
            prepend = (name === "prepend");

          $.fn[name] = function (value) {
            var self = this;

            if (!containsTinyMCE(self)) {
              return origFn.apply(self, arguments);
            }

            if (value !== undef) {
              if (typeof value === "string") {
                self.filter(":tinymce").each(function (i, node) {
                  var ed = tinyMCEInstance(node);

                  if (ed) {
                    ed.setContent(prepend ? value + ed.getContent() : ed.getContent() + value);
                  }
                });
              }

              origFn.apply(self.not(":tinymce"), arguments);

              return self; // return original set for chaining
            }
          };
        });

        // Makes sure that the editor instance gets properly destroyed when the parent element is removed
        $.each(["remove", "replaceWith", "replaceAll", "empty"], function (i, name) {
          var origFn = jQueryFn[name] = $.fn[name];

          $.fn[name] = function () {
            removeEditors.call(this, name);

            return origFn.apply(this, arguments);
          };
        });

        jQueryFn.attr = $.fn.attr;

        // Makes sure that $('#tinymce_id').attr('value') gets the editors current HTML contents
        $.fn.attr = function (name, value) {
          var self = this, args = arguments;

          if ((!name) || (name !== "value") || (!containsTinyMCE(self))) {
            if (value !== undef) {
              return jQueryFn.attr.apply(self, args);
            }

            return jQueryFn.attr.apply(self, args);
          }

          if (value !== undef) {
            loadOrSave.call(self.filter(":tinymce"), value);
            jQueryFn.attr.apply(self.not(":tinymce"), args);

            return self; // return original set for chaining
          }

          var node = self[0], ed = tinyMCEInstance(node);

          return ed ? ed.getContent({ save: true }) : jQueryFn.attr.apply($(node), args);
        };
      };
    };
  }
);
