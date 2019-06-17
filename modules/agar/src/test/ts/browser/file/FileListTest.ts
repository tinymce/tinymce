import { UnitTest } from '@ephox/bedrock';
import { RawAssertions } from 'ephox/agar/api/Main';
import { createFile } from 'ephox/agar/api/Files';
import { Blob } from '@ephox/dom-globals';
import { createFileList } from 'ephox/agar/file/FileList';
import { Type } from '@ephox/katamari';

UnitTest.test('FileListTest', () => {
  const files = createFileList([
    createFile('a.txt', 1234, new Blob(['123'], { type: 'text/plain' })),
    createFile('b.html', 1234, new Blob(['123'], { type: 'text/html' }))
  ]);

  RawAssertions.assertEq('Should be the expected file list length', 2, files.length);
  RawAssertions.assertEq('Should be expected file by index', 'a.txt', files[0].name);
  RawAssertions.assertEq('Should be expected file by item index', 'a.txt', files.item(0).name);
  RawAssertions.assertEq('Should be expected file by index', 'b.html', files[1].name);
  RawAssertions.assertEq('Should be expected file by item index', 'b.html', files.item(1).name);
  RawAssertions.assertEq('Should not be an array', false, Type.isArray(files));
});
