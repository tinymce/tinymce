/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import AbsoluteLayout from './AbsoluteLayout';

/**
 * This layout manager places controls in a grid.
 *
 * @setting {Number} spacing Spacing between controls.
 * @setting {Number} spacingH Horizontal spacing between controls.
 * @setting {Number} spacingV Vertical spacing between controls.
 * @setting {Number} columns Number of columns to use.
 * @setting {String/Array} alignH start|end|center|stretch or array of values for each column.
 * @setting {String/Array} alignV start|end|center|stretch or array of values for each column.
 * @setting {String} pack start|end
 *
 * @class tinymce.ui.GridLayout
 * @extends tinymce.ui.AbsoluteLayout
 */

export default AbsoluteLayout.extend({
  /**
   * Recalculates the positions of the controls in the specified container.
   *
   * @method recalc
   * @param {tinymce.ui.Container} container Container instance to recalc.
   */
  recalc (container) {
    let settings, rows, cols, items, contLayoutRect, width, height, rect,
      ctrlLayoutRect, ctrl, x, y, posX, posY, ctrlSettings, contPaddingBox, align, spacingH, spacingV, alignH, alignV, maxX, maxY;
    const colWidths = [];
    const rowHeights = [];
    let ctrlMinWidth, ctrlMinHeight, availableWidth, availableHeight, reverseRows, idx;

    // Get layout settings
    settings = container.settings;
    items = container.items().filter(':visible');
    contLayoutRect = container.layoutRect();
    cols = settings.columns || Math.ceil(Math.sqrt(items.length));
    rows = Math.ceil(items.length / cols);
    spacingH = settings.spacingH || settings.spacing || 0;
    spacingV = settings.spacingV || settings.spacing || 0;
    alignH = settings.alignH || settings.align;
    alignV = settings.alignV || settings.align;
    contPaddingBox = container.paddingBox;
    reverseRows = 'reverseRows' in settings ? settings.reverseRows : container.isRtl();

    if (alignH && typeof alignH === 'string') {
      alignH = [alignH];
    }

    if (alignV && typeof alignV === 'string') {
      alignV = [alignV];
    }

    // Zero padd columnWidths
    for (x = 0; x < cols; x++) {
      colWidths.push(0);
    }

    // Zero padd rowHeights
    for (y = 0; y < rows; y++) {
      rowHeights.push(0);
    }

    // Calculate columnWidths and rowHeights
    for (y = 0; y < rows; y++) {
      for (x = 0; x < cols; x++) {
        ctrl = items[y * cols + x];

        // Out of bounds
        if (!ctrl) {
          break;
        }

        ctrlLayoutRect = ctrl.layoutRect();
        ctrlMinWidth = ctrlLayoutRect.minW;
        ctrlMinHeight = ctrlLayoutRect.minH;

        colWidths[x] = ctrlMinWidth > colWidths[x] ? ctrlMinWidth : colWidths[x];
        rowHeights[y] = ctrlMinHeight > rowHeights[y] ? ctrlMinHeight : rowHeights[y];
      }
    }

    // Calculate maxX
    availableWidth = contLayoutRect.innerW - contPaddingBox.left - contPaddingBox.right;
    for (maxX = 0, x = 0; x < cols; x++) {
      maxX += colWidths[x] + (x > 0 ? spacingH : 0);
      availableWidth -= (x > 0 ? spacingH : 0) + colWidths[x];
    }

    // Calculate maxY
    availableHeight = contLayoutRect.innerH - contPaddingBox.top - contPaddingBox.bottom;
    for (maxY = 0, y = 0; y < rows; y++) {
      maxY += rowHeights[y] + (y > 0 ? spacingV : 0);
      availableHeight -= (y > 0 ? spacingV : 0) + rowHeights[y];
    }

    maxX += contPaddingBox.left + contPaddingBox.right;
    maxY += contPaddingBox.top + contPaddingBox.bottom;

    // Calculate minW/minH
    rect = {};
    rect.minW = maxX + (contLayoutRect.w - contLayoutRect.innerW);
    rect.minH = maxY + (contLayoutRect.h - contLayoutRect.innerH);

    rect.contentW = rect.minW - contLayoutRect.deltaW;
    rect.contentH = rect.minH - contLayoutRect.deltaH;
    rect.minW = Math.min(rect.minW, contLayoutRect.maxW);
    rect.minH = Math.min(rect.minH, contLayoutRect.maxH);
    rect.minW = Math.max(rect.minW, contLayoutRect.startMinWidth);
    rect.minH = Math.max(rect.minH, contLayoutRect.startMinHeight);

    // Resize container container if minSize was changed
    if (contLayoutRect.autoResize && (rect.minW !== contLayoutRect.minW || rect.minH !== contLayoutRect.minH)) {
      rect.w = rect.minW;
      rect.h = rect.minH;

      container.layoutRect(rect);
      this.recalc(container);

      // Forced recalc for example if items are hidden/shown
      if (container._lastRect === null) {
        const parentCtrl = container.parent();
        if (parentCtrl) {
          parentCtrl._lastRect = null;
          parentCtrl.recalc();
        }
      }

      return;
    }

    // Update contentW/contentH so absEnd moves correctly
    if (contLayoutRect.autoResize) {
      rect = container.layoutRect(rect);
      rect.contentW = rect.minW - contLayoutRect.deltaW;
      rect.contentH = rect.minH - contLayoutRect.deltaH;
    }

    let flexV;

    if (settings.packV === 'start') {
      flexV = 0;
    } else {
      flexV = availableHeight > 0 ? Math.floor(availableHeight / rows) : 0;
    }

    // Calculate totalFlex
    let totalFlex = 0;
    const flexWidths = settings.flexWidths;
    if (flexWidths) {
      for (x = 0; x < flexWidths.length; x++) {
        totalFlex += flexWidths[x];
      }
    } else {
      totalFlex = cols;
    }

    // Calculate new column widths based on flex values
    const ratio = availableWidth / totalFlex;
    for (x = 0; x < cols; x++) {
      colWidths[x] += flexWidths ? flexWidths[x] * ratio : ratio;
    }

    // Move/resize controls
    posY = contPaddingBox.top;
    for (y = 0; y < rows; y++) {
      posX = contPaddingBox.left;
      height = rowHeights[y] + flexV;

      for (x = 0; x < cols; x++) {
        if (reverseRows) {
          idx = y * cols + cols - 1 - x;
        } else {
          idx = y * cols + x;
        }

        ctrl = items[idx];

        // No more controls to render then break
        if (!ctrl) {
          break;
        }

        // Get control settings and calculate x, y
        ctrlSettings = ctrl.settings;
        ctrlLayoutRect = ctrl.layoutRect();
        width = Math.max(colWidths[x], ctrlLayoutRect.startMinWidth);
        ctrlLayoutRect.x = posX;
        ctrlLayoutRect.y = posY;

        // Align control horizontal
        align = ctrlSettings.alignH || (alignH ? (alignH[x] || alignH[0]) : null);
        if (align === 'center') {
          ctrlLayoutRect.x = posX + (width / 2) - (ctrlLayoutRect.w / 2);
        } else if (align === 'right') {
          ctrlLayoutRect.x = posX + width - ctrlLayoutRect.w;
        } else if (align === 'stretch') {
          ctrlLayoutRect.w = width;
        }

        // Align control vertical
        align = ctrlSettings.alignV || (alignV ? (alignV[x] || alignV[0]) : null);
        if (align === 'center') {
          ctrlLayoutRect.y = posY + (height / 2) - (ctrlLayoutRect.h / 2);
        } else if (align === 'bottom') {
          ctrlLayoutRect.y = posY + height - ctrlLayoutRect.h;
        } else if (align === 'stretch') {
          ctrlLayoutRect.h = height;
        }

        ctrl.layoutRect(ctrlLayoutRect);

        posX += width + spacingH;

        if (ctrl.recalc) {
          ctrl.recalc();
        }
      }

      posY += height + spacingV;
    }
  }
});