import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';

import { createFile } from 'ephox/agar/api/Files';
import { createFileList } from 'ephox/agar/file/FileList';

UnitTest.test('FileListTest', () => {
  const inputFiles = [
    createFile('a.txt', 1234, new Blob([ '123' ], { type: 'text/plain' })),
    createFile('b.html', 1234, new Blob([ '123' ], { type: 'text/html' }))
  ];
  const files = createFileList(inputFiles);
  inputFiles.push(createFile('c.css', 1234, new Blob([ '123' ], { type: 'text/css' })));

  Assert.eq('Should be the expected file list length', 2, files.length);
  Assert.eq('Should be expected file by index', 'a.txt', files[0].name);
  Assert.eq('Should be expected file by item index', 'a.txt', files.item(0)?.name);
  Assert.eq('Should be expected file by index', 'b.html', files[1].name);
  Assert.eq('Should be expected file by item index', 'b.html', files.item(1)?.name);
  Assert.eq('Should return null for out of range item index', null, files.item(2));
  Assert.eq('Should return null for negative item index', null, files.item(-1));
  Assert.eq('Should iterate over the original file snapshot', [ 'a.txt', 'b.html' ], [ ...files ].map((file) => file.name));
  Assert.eq('Should not be an array', false, Type.isArray(files));
});
