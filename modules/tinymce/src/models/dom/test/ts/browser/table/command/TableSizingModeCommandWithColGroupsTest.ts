import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import { tableSizingModeScenarioTest } from '../../../module/table/TableSizingModeCommandUtil';

describe('browser.tinymce.models.dom.table.command.TableSizingModeCommandWithColGroupsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    width: 850,
    content_css: false,
    content_style: 'body { margin: 10px; max-width: 800px }',
    base_url: '/project/tinymce/js/tinymce',
    table_use_colgroups: true
  }, []);

  it('TINY-6000, TINY-6050: Percent (relative) to pixel (fixed) sizing', () => tableSizingModeScenarioTest(hook.editor(), true, {
    mode: 'relative',
    tableWidth: 100,
    rows: 3,
    cols: 2,
    newMode: 'fixed',
    expectedTableWidth: 800,
    expectedWidths: [[ 400, 400 ]]
  }));

  it('TINY-6000, TINY-6050: Percent (relative) to none (responsive) sizing', () => tableSizingModeScenarioTest(hook.editor(), true, {
    mode: 'relative',
    tableWidth: 100,
    rows: 3,
    cols: 2,
    newMode: 'responsive',
    expectedTableWidth: null,
    expectedWidths: [[ null, null ]]
  }));

  it('TINY-6000, TINY-6050: Pixel (fixed) to percent (relative) sizing', () => tableSizingModeScenarioTest(hook.editor(), true, {
    mode: 'fixed',
    tableWidth: 600,
    rows: 2,
    cols: 2,
    newMode: 'relative',
    expectedTableWidth: 75,
    expectedWidths: [[ 50, 50 ]]
  }));

  it('TINY-6000, TINY-6050: Pixel (fixed) to none (responsive) sizing', () => tableSizingModeScenarioTest(hook.editor(), true, {
    mode: 'fixed',
    tableWidth: 600,
    rows: 2,
    cols: 2,
    newMode: 'responsive',
    expectedTableWidth: null,
    expectedWidths: [[ null, null ]]
  }));

  it('TINY-6000, TINY-6050: None (responsive) to percent (relative) sizing', () => tableSizingModeScenarioTest(hook.editor(), true, {
    mode: 'responsive',
    tableWidth: null,
    rows: 2,
    cols: 3,
    newMode: 'relative',
    expectedTableWidth: 16,
    expectedWidths: [[ 33, 33, 33 ]]
  }));

  it('TINY-6000, TINY-6050: None (responsive) to pixel (fixed) sizing', () => tableSizingModeScenarioTest(hook.editor(), true, {
    mode: 'responsive',
    tableWidth: null,
    rows: 2,
    cols: 3,
    newMode: 'fixed',
    expectedTableWidth: 133,
    expectedWidths: [[ 44, 44, 44 ]]
  }));
});
