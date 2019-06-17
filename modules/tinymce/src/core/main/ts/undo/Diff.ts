/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/**
 * JS Implementation of the O(ND) Difference Algorithm by Eugene W. Myers.
 *
 * @class tinymce.undo.Diff
 * @private
 */

const KEEP = 0, INSERT = 1, DELETE = 2;

const diff = function (left, right) {
  const size = left.length + right.length + 2;
  const vDown = new Array(size);
  const vUp = new Array(size);

  const snake = function (start, end, diag) {
    return {
      start,
      end,
      diag
    };
  };

  const buildScript = function (start1, end1, start2, end2, script) {
    const middle = getMiddleSnake(start1, end1, start2, end2);

    if (middle === null || middle.start === end1 && middle.diag === end1 - end2 ||
      middle.end === start1 && middle.diag === start1 - start2) {
      let i = start1;
      let j = start2;
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
      for (let i2 = middle.start; i2 < middle.end; ++i2) {
        script.push([KEEP, left[i2]]);
      }
      buildScript(middle.end, end1, middle.end - middle.diag, end2, script);
    }
  };

  const buildSnake = function (start, diag, end1, end2) {
    let end = start;
    while (end - diag < end2 && end < end1 && left[end] === right[end - diag]) {
      ++end;
    }
    return snake(start, end, diag);
  };

  const getMiddleSnake = function (start1, end1, start2, end2) {
    // Myers Algorithm
    // Initialisations
    const m = end1 - start1;
    const n = end2 - start2;
    if (m === 0 || n === 0) {
      return null;
    }

    const delta = m - n;
    const sum = n + m;
    const offset = (sum % 2 === 0 ? sum : sum + 1) / 2;
    vDown[1 + offset] = start1;
    vUp[1 + offset] = end1 + 1;
    let d, k, i, x, y;

    for (d = 0; d <= offset; ++d) {
      // Down
      for (k = -d; k <= d; k += 2) {
        // First step

        i = k + offset;
        if (k === -d || k !== d && vDown[i - 1] < vDown[i + 1]) {
          vDown[i] = vDown[i + 1];
        } else {
          vDown[i] = vDown[i - 1] + 1;
        }

        x = vDown[i];
        y = x - start1 + start2 - k;

        while (x < end1 && y < end2 && left[x] === right[y]) {
          vDown[i] = ++x;
          ++y;
        }
        // Second step
        if (delta % 2 !== 0 && delta - d <= k && k <= delta + d) {
          if (vUp[i - delta] <= vDown[i]) {
            return buildSnake(vUp[i - delta], k + start1 - start2, end1, end2);
          }
        }
      }

      // Up
      for (k = delta - d; k <= delta + d; k += 2) {
        // First step
        i = k + offset - delta;
        if (k === delta - d || k !== delta + d && vUp[i + 1] <= vUp[i - 1]) {
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

  const script = [];
  buildScript(0, left.length, 0, right.length, script);
  return script;
};

export default {
  KEEP,
  DELETE,
  INSERT,
  diff
};