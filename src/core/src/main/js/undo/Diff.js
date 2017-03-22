/**
 * Diff.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * JS Implementation of the O(ND) Difference Algorithm by Eugene W. Myers.
 *
 * @class tinymce.undo.Diff
 * @private
 */
define(
  'tinymce.core.undo.Diff',
  [
  ],
  function () {
    var KEEP = 0, INSERT = 1, DELETE = 2;

    var diff = function (left, right) {
      var size = left.length + right.length + 2;
      var vDown = new Array(size);
      var vUp = new Array(size);

      var snake = function (start, end, diag) {
        return {
          start: start,
          end: end,
          diag: diag
        };
      };

      var buildScript = function (start1, end1, start2, end2, script) {
        var middle = getMiddleSnake(start1, end1, start2, end2);

        if (middle === null || middle.start === end1 && middle.diag === end1 - end2 ||
          middle.end === start1 && middle.diag === start1 - start2) {
          var i = start1;
          var j = start2;
          while (i < end1 || j < end2) {
            if (i < end1 && j < end2 && left[i] === right[j]) {
              script.push([KEEP, left[i]]);
              ++i;
              ++j;
            } else {
              if (end1 - start1 > end2 - start2) {
                script.push([DELETE, left[i]]);
                ++i;
              } else {
                script.push([INSERT, right[j]]);
                ++j;
              }
            }
          }
        } else {
          buildScript(start1, middle.start, start2, middle.start - middle.diag, script);
          for (var i2 = middle.start; i2 < middle.end; ++i2) {
            script.push([KEEP, left[i2]]);
          }
          buildScript(middle.end, end1, middle.end - middle.diag, end2, script);
        }
      };

      var buildSnake = function (start, diag, end1, end2) {
        var end = start;
        while (end - diag < end2 && end < end1 && left[end] === right[end - diag]) {
          ++end;
        }
        return snake(start, end, diag);
      };

      var getMiddleSnake = function (start1, end1, start2, end2) {
        // Myers Algorithm
        // Initialisations
        var m = end1 - start1;
        var n = end2 - start2;
        if (m === 0 || n === 0) {
          return null;
        }

        var delta = m - n;
        var sum = n + m;
        var offset = (sum % 2 === 0 ? sum : sum + 1) / 2;
        vDown[1 + offset] = start1;
        vUp[1 + offset] = end1 + 1;

        for (var d = 0; d <= offset; ++d) {
          // Down
          for (var k = -d; k <= d; k += 2) {
            // First step

            var i = k + offset;
            if (k === -d || k != d && vDown[i - 1] < vDown[i + 1]) {
              vDown[i] = vDown[i + 1];
            } else {
              vDown[i] = vDown[i - 1] + 1;
            }

            var x = vDown[i];
            var y = x - start1 + start2 - k;

            while (x < end1 && y < end2 && left[x] === right[y]) {
              vDown[i] = ++x;
              ++y;
            }
            // Second step
            if (delta % 2 != 0 && delta - d <= k && k <= delta + d) {
              if (vUp[i - delta] <= vDown[i]) {
                return buildSnake(vUp[i - delta], k + start1 - start2, end1, end2);
              }
            }
          }

          // Up
          for (k = delta - d; k <= delta + d; k += 2) {
            // First step
            i = k + offset - delta;
            if (k === delta - d || k != delta + d && vUp[i + 1] <= vUp[i - 1]) {
              vUp[i] = vUp[i + 1] - 1;
            } else {
              vUp[i] = vUp[i - 1];
            }

            x = vUp[i] - 1;
            y = x - start1 + start2 - k;
            while (x >= start1 && y >= start2 && left[x] === right[y]) {
              vUp[i] = x--;
              y--;
            }
            // Second step
            if (delta % 2 === 0 && -d <= k && k <= d) {
              if (vUp[i] <= vDown[i + delta]) {
                return buildSnake(vUp[i], k + start1 - start2, end1, end2);
              }
            }
          }
        }
      };

      var script = [];
      buildScript(0, left.length, 0, right.length, script);
      return script;
    };

    return {
      KEEP: KEEP,
      DELETE: DELETE,
      INSERT: INSERT,
      diff: diff
    };
  }
);