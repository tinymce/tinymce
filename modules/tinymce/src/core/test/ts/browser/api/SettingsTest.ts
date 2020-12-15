import { Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Settings from 'tinymce/core/api/Settings';

UnitTest.test('browser.tinymce.core.api.SettingsTest', () => {
  Assertions.assertEq('Should be default id', 'tinymce', Settings.getBodyId(new Editor('id', {}, EditorManager)));
  Assertions.assertEq('Should be specified id', 'x', Settings.getBodyId(new Editor('id', { body_id: 'x' }, EditorManager)));
  Assertions.assertEq('Should be specified id for ida', 'a', Settings.getBodyId(new Editor('ida', { body_id: 'ida=a,idb=b' }, EditorManager)));
  Assertions.assertEq('Should be specified id for idb', 'b', Settings.getBodyId(new Editor('idb', { body_id: 'ida=a,idb=b' }, EditorManager)));
  Assertions.assertEq('Should be default id for idc', 'tinymce', Settings.getBodyId(new Editor('idc', { body_id: 'ida=a,idb=b' }, EditorManager)));

  Assertions.assertEq('Should be default class', '', Settings.getBodyClass(new Editor('id', {}, EditorManager)));
  Assertions.assertEq('Should be specified class', 'x', Settings.getBodyClass(new Editor('id', { body_class: 'x' }, EditorManager)));
  Assertions.assertEq('Should be specified class for ida', 'a', Settings.getBodyClass(new Editor('ida', { body_class: 'ida=a,idb=b' }, EditorManager)));
  Assertions.assertEq('Should be specified class for idb', 'b', Settings.getBodyClass(new Editor('idb', { body_class: 'ida=a,idb=b' }, EditorManager)));
  Assertions.assertEq('Should be default class for idc', '', Settings.getBodyClass(new Editor('idc', { body_class: 'ida=a,idb=b' }, EditorManager)));

  Assertions.assertEq('Should default content_css_cors to false', false, Settings.shouldUseContentCssCors(new Editor('id', {}, EditorManager)));
  Assertions.assertEq('Should return true if content_css_cors is set', true, Settings.shouldUseContentCssCors(new Editor('id', { content_css_cors: true }, EditorManager)));

  Assertions.assertEq('Should default referrer_policy to empty string', '', Settings.getReferrerPolicy(new Editor('id', {}, EditorManager)));
  Assertions.assertEq('Should return origin if referrer_policy is configured to origin', 'origin', Settings.getReferrerPolicy(new Editor('id', { referrer_policy: 'origin' }, EditorManager)));
});
