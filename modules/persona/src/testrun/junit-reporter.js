'use strict';
/**
 * forked from https://github.com/nodejs/node/blob/2a6f90813f4802def79f2df1bfe20e95df279abf/lib/internal/test_runner/reporter/junit.js
 * Which seems to have been slapped together in late 2023 and never touched again.
 *
 * Changes:
 * - Ported to consumer JS instead of using primordials
 * - Set the `file` attribute for suites and cases (or attempt to, without revealing the absolute path)
 * - Set testcase `classname` to the parent `name` as most other junit implementations do

 * We could in theory PR this, but it's not clear if it would be worth the effort.
 * We tend to be quite opinionated and it might be handy to have it customisable.
 */

import { hostname } from "os";

import util from "node:util";
import path from "node:path";

const inspectOptions = { __proto__: null, colors: false, breakLength: Infinity };
const HOSTNAME = hostname();

function escapeAttribute(s = '') {
  return escapeContent(s.replace(/\n/g, '').replace(/"/g, '&quot;'));
}

function escapeContent(s = '') {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function escapeComment(s = '') {
  return s.replace(/--/g, '&#45;&#45;');
}

function treeToXML(tree) {
  if (typeof tree === 'string') {
    return `${escapeContent(tree)}\n`;
  }
  const {
    tag, attrs, nesting, children, comment,
  } = tree;
  const indent = '\t'.repeat(nesting + 1);
  if (comment) {
    return `${indent}<!-- ${escapeComment(comment)} -->\n`;
  }
  const attrsString = Object.entries(attrs)
    .map(([ key, value ]) => `${key}="${escapeAttribute(String(value))}"`)
    .join(' ');
  if (!children?.length) {
    return `${indent}<${tag} ${attrsString}/>\n`;
  }
  const childrenString = (children ?? []).map(treeToXML).join('');
  return `${indent}<${tag} ${attrsString}>\n${childrenString}${indent}</${tag}>\n`;
}

function isFailure(node) {
  return (node?.children && node.children.some((c) => c.tag === 'failure')) || node?.attrs?.failures;
}

function isSkipped(node) {
  return (node?.children && node.children.some((c) => c.tag === 'skipped')) || node?.attrs?.failures;
}

export default async function* junitReporter(source) {
  yield '<?xml version="1.0" encoding="utf-8"?>\n';
  yield '<testsuites>\n';
  const runnerPath = process.cwd();
  let currentSuite = null;
  const roots = [];

  function startTest(event) {
    const originalSuite = currentSuite;
    currentSuite = {
      __proto__: null,
      attrs: {
        __proto__: null,
        name: event.data.name,
        file: path.relative(runnerPath, event.data.file)
      },
      nesting: event.data.nesting,
      parent: currentSuite,
      children: [],
    };
    if (originalSuite?.children) {
      originalSuite.children.push(currentSuite);
    }
    if (!currentSuite.parent) {
      roots.push(currentSuite);
    }
  }

  for await (const event of source) {
    switch (event.type) {
      case 'test:start': {
        startTest(event);
        break;
      }
      case 'test:pass':
      case 'test:fail': {
        if (!currentSuite) {
          startTest({ __proto__: null, data: { __proto__: null, name: 'root', nesting: 0 } });
        }
        if (currentSuite.attrs.name !== event.data.name ||
          currentSuite.nesting !== event.data.nesting) {
          startTest(event);
        }
        const currentTest = currentSuite;
        if (currentSuite?.nesting === event.data.nesting) {
          currentSuite = currentSuite.parent;
        }
        currentTest.attrs.time = (event.data.details.duration_ms / 1000).toFixed(6);
        const nonCommentChildren = currentTest.children.filter((c) => c.comment == null);
        if (nonCommentChildren.length > 0) {
          currentTest.tag = 'testsuite';
          currentTest.attrs.disabled = 0;
          currentTest.attrs.errors = 0;
          currentTest.attrs.tests = nonCommentChildren.length;
          currentTest.attrs.failures = currentTest.children.filter(isFailure).length;
          currentTest.attrs.skipped = currentTest.children.filter(isSkipped).length;
          currentTest.attrs.hostname = HOSTNAME;
        } else {
          if (currentSuite === null) {
            throw new Error(`test running outside a describe block: "${event.data.name}" in ${path.relative(runnerPath, event.data.file)}`);
          }
          currentTest.tag = 'testcase';
          currentTest.attrs.classname = currentSuite.attrs.name;
          if (event.data.skip) {
            currentTest.children.push({
              __proto__: null, nesting: event.data.nesting + 1, tag: 'skipped',
              attrs: { __proto__: null, type: 'skipped', message: event.data.skip },
            });
          }
          if (event.data.todo) {
            currentTest.children.push({
              __proto__: null, nesting: event.data.nesting + 1, tag: 'skipped',
              attrs: { __proto__: null, type: 'todo', message: event.data.todo },
            });
          }
          if (event.type === 'test:fail') {
            const error = event.data.details?.error;
            currentTest.children.push({
              __proto__: null,
              nesting: event.data.nesting + 1,
              tag: 'failure',
              attrs: { __proto__: null, type: error?.failureType || error?.code, message: error?.message ?? '' },
              children: [util.inspect(error, inspectOptions)],
            });
            currentTest.failures = 1;
            currentTest.attrs.failure = error?.message ?? '';
          }
        }
        break;
      }
      case 'test:diagnostic': {
        const parent = currentSuite?.children ?? roots;
        parent.push({
          __proto__: null, nesting: event.data.nesting, comment: event.data.message,
        });
        break;
      } default:
        break;
    }
  }
  for (const suite of roots) {
    yield treeToXML(suite);
  }
  yield '</testsuites>\n';
}
