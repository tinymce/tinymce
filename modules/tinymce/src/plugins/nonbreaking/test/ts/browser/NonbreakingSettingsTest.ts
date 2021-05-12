import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Settings from 'tinymce/plugins/nonbreaking/api/Settings';

describe('browser.tinymce.plugins.nonbreaking.NonbreakingSettingsTest', () => {
  it('TBA: Should be 0 as default', () => {
    assert.equal(Settings.getKeyboardSpaces(new Editor('x', {}, EditorManager)), 0);
  });

  it('TBA: Should return 3 if set to true', () => {
    assert.equal(Settings.getKeyboardSpaces(new Editor('x', { nonbreaking_force_tab: true }, EditorManager)), 3);
  });

  it('TBA: Should return 0 if set to false', () => {
    assert.equal(Settings.getKeyboardSpaces(new Editor('x', { nonbreaking_force_tab: false }, EditorManager)), 0);
  });

  it('TBA: Should return number if set', () => {
    assert.equal(Settings.getKeyboardSpaces(new Editor('x', { nonbreaking_force_tab: 4 }, EditorManager)), 4);
  });
});
