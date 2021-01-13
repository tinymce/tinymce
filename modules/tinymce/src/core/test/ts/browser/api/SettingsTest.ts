import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Settings from 'tinymce/core/api/Settings';

describe('browser.tinymce.core.api.SettingsTest', () => {
  it('getBodyId', () => {
    assert.equal(Settings.getBodyId(new Editor('id', {}, EditorManager)), 'tinymce', 'Should be default id');
    assert.equal(Settings.getBodyId(new Editor('id', { body_id: 'x' }, EditorManager)), 'x', 'Should be specified id');
    assert.equal(Settings.getBodyId(new Editor('ida', { body_id: 'ida=a,idb=b' }, EditorManager)), 'a', 'Should be specified id for ida');
    assert.equal(Settings.getBodyId(new Editor('idb', { body_id: 'ida=a,idb=b' }, EditorManager)), 'b', 'Should be specified id for idb');
    assert.equal(Settings.getBodyId(new Editor('idc', { body_id: 'ida=a,idb=b' }, EditorManager)), 'tinymce', 'Should be default id for idc');
  });

  it('getBodyClass', () => {
    assert.equal(Settings.getBodyClass(new Editor('id', {}, EditorManager)), '', 'Should be default class');
    assert.equal(Settings.getBodyClass(new Editor('id', { body_class: 'x' }, EditorManager)), 'x', 'Should be specified class');
    assert.equal(Settings.getBodyClass(new Editor('ida', { body_class: 'ida=a,idb=b' }, EditorManager)), 'a', 'Should be specified class for ida');
    assert.equal(Settings.getBodyClass(new Editor('idb', { body_class: 'ida=a,idb=b' }, EditorManager)), 'b', 'Should be specified class for idb');
    assert.equal(Settings.getBodyClass(new Editor('idc', { body_class: 'ida=a,idb=b' }, EditorManager)), '', 'Should be default class for idc');
  });

  it('shouldUseContentCssCors', () => {
    assert.isFalse(Settings.shouldUseContentCssCors(new Editor('id', {}, EditorManager)), 'Should default content_css_cors to false');
    assert.isTrue(Settings.shouldUseContentCssCors(new Editor('id', { content_css_cors: true }, EditorManager)), 'Should return true if content_css_cors is set');
  });

  it('getReferrerPolicy', () => {
    assert.equal(Settings.getReferrerPolicy(new Editor('id', {}, EditorManager)), '', 'Should default referrer_policy to empty string');
    assert.equal(Settings.getReferrerPolicy(new Editor('id', { referrer_policy: 'origin' }, EditorManager)), 'origin', 'Should return origin if referrer_policy is configured to origin');
  });
});
