import { Files } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';

import { createFileList } from 'ephox/dragster/filelist/FileList';

UnitTest.test('FileListTest', () => {
  const files = createFileList([
    Files.createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/plain' })),
    Files.createFile('b.html', 1234, new Blob([ '123' ], { type: 'text/html' }))
  ]);

  Assert.eq('Should be the expected file list length', 2, files.length);
  Assert.eq('Should be expected file by index', 'a.txt', files[0].name);
  Assert.eq('Should be expected file by item index', 'a.txt', files.item(0)?.name);
  Assert.eq('Should be expected file by index', 'b.html', files[1].name);
  Assert.eq('Should be expected file by item index', 'b.html', files.item(1)?.name);
  Assert.eq('Should not be an array', false, Type.isArray(files));
});
