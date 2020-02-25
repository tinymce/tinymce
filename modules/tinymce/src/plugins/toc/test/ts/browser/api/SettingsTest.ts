import { Assertions } from '@ephox/agar';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import * as Settings from 'tinymce/plugins/toc/api/Settings';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('browser.tinymce.plugins.toc.api.SettingsTest', function () {
  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be default toc class', 'mce-toc', Settings.getTocClass(new Editor('x', {}, EditorManager)));
  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be specified toc class', 'c', Settings.getTocClass(new Editor('x', { toc_class: 'c' }, EditorManager)));

  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be default h2', 'h2', Settings.getTocHeader(new Editor('x', {}, EditorManager)));
  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be h3', 'h3', Settings.getTocHeader(new Editor('x', { toc_header: 'h3' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be h2 since h75 is invalid', 'h2', Settings.getTocHeader(new Editor('x', { toc_header: 'h75' }, EditorManager)));

  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be default 3', 3, Settings.getTocDepth(new Editor('x', {}, EditorManager)));
  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be specified toc depth (string)', 5, Settings.getTocDepth(new Editor('x', { toc_depth: '5' }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be specified toc depth', 5, Settings.getTocDepth(new Editor('x', { toc_depth: 5 }, EditorManager)));
  Assertions.assertEq('TestCase-TBA: TableOfContents: Should be default toc depth for invalid', 3, Settings.getTocDepth(new Editor('x', { toc_depth: '53' }, EditorManager)));
});
