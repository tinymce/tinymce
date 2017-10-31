/**
 * CellSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

 /*eslint no-bitwise:0 */

define(
  'tinymce.plugins.table.selection.CellSelection',

  [
    'ephox.darwin.api.InputHandlers',
    'ephox.darwin.api.SelectionAnnotation',
    'ephox.darwin.api.SelectionKeys',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.selection.core.SelectionDirection',
    'tinymce.plugins.table.alien.Util',
    'tinymce.plugins.table.queries.Direction',
    'tinymce.plugins.table.selection.Ephemera'
  ],

  function (InputHandlers, SelectionAnnotation, SelectionKeys, Fun, Option, Struct, TableLookup, Compare, Element, Node, Text, Attr, Traverse, Selection, SelectionDirection, Util, Direction, Ephemera) {
    return function (editor, lazyResize) {
      var handlerStruct = Struct.immutableBag(['mousedown', 'mouseover', 'mouseup', 'keyup', 'keydown'], []);
      var handlers = Option.none();

      var annotations = SelectionAnnotation.byAttr(Ephemera);

      editor.on('init', function (e) {
        var win = editor.getWin();
        var body = Util.getBody(editor);
        var isRoot = Util.getIsRoot(editor);

        var syncSelection = function () {
          var sel = editor.selection;
          var start = Element.fromDom(sel.getStart());
          var end = Element.fromDom(sel.getEnd());
          var startTable = TableLookup.table(start);
          var endTable = TableLookup.table(end);
          var sameTable = startTable.bind(function (tableStart) {
            return endTable.bind(function (tableEnd) {
              return Compare.eq(tableStart, tableEnd) ? Option.some(true) : Option.none();
            });
          });
          sameTable.fold(function () {
            annotations.clear(body);
          }, Fun.noop);
        };

        var mouseHandlers = InputHandlers.mouse(win, body, isRoot, annotations);
        var keyHandlers = InputHandlers.keyboard(win, body, isRoot, annotations);

        var handleResponse = function (event, response) {
          if (response.kill()) {
            event.kill();
          }
          response.selection().each(function (ns) {
            var relative = Selection.relative(ns.start(), ns.finish());
            var rng = SelectionDirection.asLtrRange(win, relative);
            editor.selection.setRng(rng);
          });
        };

        var keyup = function (event) {
          var wrappedEvent = wrapEvent(event);
          // Note, this is an optimisation.
          if (wrappedEvent.raw().shiftKey && SelectionKeys.isNavigation(wrappedEvent.raw().which)) {
            var rng = editor.selection.getRng();
            var start = Element.fromDom(rng.startContainer);
            var end = Element.fromDom(rng.endContainer);
            keyHandlers.keyup(wrappedEvent, start, rng.startOffset, end, rng.endOffset).each(function (response) {
              handleResponse(wrappedEvent, response);
            });
          }
        };

        var checkLast = function (last) {
          return !Attr.has(last, 'data-mce-bogus') && Node.name(last) !== 'br' && !(Node.isText(last) && Text.get(last).length === 0);
        };

        var getLast = function () {
          var body = Element.fromDom(editor.getBody());

          var lastChild = Traverse.lastChild(body);

          var getPrevLast = function (last) {
            return Traverse.prevSibling(last).bind(function (prevLast) {
              return checkLast(prevLast) ? Option.some(prevLast) : getPrevLast(prevLast);
            });
          };

          return lastChild.bind(function (last) {
            return checkLast(last) ? Option.some(last) : getPrevLast(last);
          });
        };

        var keydown = function (event) {
          var wrappedEvent = wrapEvent(event);
          lazyResize().each(function (resize) {
            resize.hideBars();
          });

          if (event.which === 40) {
            getLast().each(function (last) {
              if (Node.name(last) === 'table') {
                if (editor.settings.forced_root_block) {
                  editor.dom.add(
                    editor.getBody(),
                    editor.settings.forced_root_block,
                    editor.settings.forced_root_block_attrs,
                    '<br/>'
                  );
                } else {
                  editor.dom.add(editor.getBody(), 'br');
                }
              }
            });
          }

          var rng = editor.selection.getRng();
          var startContainer = Element.fromDom(editor.selection.getStart());
          var start = Element.fromDom(rng.startContainer);
          var end = Element.fromDom(rng.endContainer);
          var direction = Direction.directionAt(startContainer).isRtl() ? SelectionKeys.rtl : SelectionKeys.ltr;
          keyHandlers.keydown(wrappedEvent, start, rng.startOffset, end, rng.endOffset, direction).each(function (response) {
            handleResponse(wrappedEvent, response);
          });
          lazyResize().each(function (resize) {
            resize.showBars();
          });
        };

        var wrapEvent = function (event) {
          // IE9 minimum
          var target = Element.fromDom(event.target);

          var stop = function () {
            event.stopPropagation();
          };

          var prevent = function () {
            event.preventDefault();
          };

          var kill = Fun.compose(prevent, stop); // more of a sequence than a compose, but same effect

          // FIX: Don't just expose the raw event. Need to identify what needs standardisation.
          return {
            'target':  Fun.constant(target),
            'x':       Fun.constant(event.x),
            'y':       Fun.constant(event.y),
            'stop':    stop,
            'prevent': prevent,
            'kill':    kill,
            'raw':     Fun.constant(event)
          };
        };

        var isLeftMouse = function (raw) {
          return raw.button === 0;
        };

        // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
        var isLeftButtonPressed = function (raw) {
          // Only added by Chrome/Firefox in June 2015.
          // This is only to fix a 1px bug (TBIO-2836) so return true if we're on an older browser
          if (raw.buttons === undefined) {
            return true;
          }

          // use bitwise & for optimal comparison
          return (raw.buttons & 1) !== 0;
        };

        var mouseDown = function (e) {
          if (isLeftMouse(e)) {
            mouseHandlers.mousedown(wrapEvent(e));
          }
        };
        var mouseOver = function (e) {
          if (isLeftButtonPressed(e)) {
            mouseHandlers.mouseover(wrapEvent(e));
          }
        };
        var mouseUp = function (e) {
          if (isLeftMouse) {
            mouseHandlers.mouseup(wrapEvent(e));
          }
        };

        editor.on('mousedown', mouseDown);
        editor.on('mouseover', mouseOver);
        editor.on('mouseup', mouseUp);
        editor.on('keyup', keyup);
        editor.on('keydown', keydown);
        editor.on('nodechange', syncSelection);

        handlers = Option.some(handlerStruct({
          mousedown: mouseDown,
          mouseover: mouseOver,
          mouseup: mouseUp,
          keyup: keyup,
          keydown: keydown
        }));
      });

      var destroy = function () {
        handlers.each(function (handlers) {
          // editor.off('mousedown', handlers.mousedown());
          // editor.off('mouseover', handlers.mouseover());
          // editor.off('mouseup', handlers.mouseup());
          // editor.off('keyup', handlers.keyup());
          // editor.off('keydown', handlers.keydown());
        });
      };

      return {
        clear: annotations.clear,
        destroy: destroy
      };
    };
  }
);
