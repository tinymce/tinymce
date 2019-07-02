/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import annyang from 'annyang';
import { console } from '@ephox/dom-globals';
import Langs from './Langs';

const prefix = 'tiny ';
const p = (r) => prefix.concat(r);

const startListening = p('start listening');
const stopListening = p('stop listening');

const selectAll = p('select all');
const insertTable = p('insert table *NumberByNumber');
const deleteTable = p('delete table');
const insertHorizontalRule = p('insert horizontal rule');
const tinyDelete = p('delete');

const tableRegex = /(\d|one|two|three|four|five|six|seven|eight|nine|ten).*by.*(\d|one|two|three|four|five|six|seven|eight|nine|ten)/;

// This feels gross, fix it fix it fix it
const conversionTable = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9
};

const register = (editor) => {
  // Debug listening to the phrases
  annyang.addCallback('result', (phrases) => console.log('annyang heard: ', phrases));

  const cmd = (command: string) => {
    console.log('voice command: ' + command);
    editor.execCommand(command);
  };

  const listen = (phrases) => {
    const phrase = phrases[0];
    const prestopped = phrase.split(stopListening);
    editor.insertContent(prestopped[0]);
  };

  const insertTableCmd = (phrase) => {
    const match = tableRegex.exec(phrase);
    const rows = match[1];
    const cols = match[2];
    const intRows = parseInt(rows, 10) || conversionTable[rows];
    const intCols = parseInt(cols, 10) || conversionTable[cols];
    editor.plugins.table.insertTable(intCols, intRows);
  };

  const deafCommands = {
    [selectAll]: () => cmd('selectAll'),
    [insertTable]: insertTableCmd,
    [deleteTable]: () => cmd('mceTableDelete'),
    [insertHorizontalRule]: () => cmd('InsertHorizontalRule'),
    [tinyDelete]: () => cmd('delete'),
    [startListening]: () => {
      console.log('started listening');
      annyang.removeCommands();
      annyang.addCommands(listeningCommands);
      annyang.addCallback('result', listen);
    }
  };

  const listeningCommands = {
    [stopListening]: () => {
      console.log('stopped listening');
      annyang.removeCommands();
      annyang.addCommands(deafCommands);
      annyang.removeCallback('result', listen);
    }
  };

  const lang = Langs.convert();
  annyang.setLanguage(lang);

  // Start off not listening
  annyang.addCommands(deafCommands);

  const start = () => annyang.start({autoRestart: true, continuous: false});
  const stop = () => annyang.abort();

  return {
    start,
    stop
  };
};

export default {
  register
};