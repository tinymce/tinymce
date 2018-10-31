import { RawAssertions, Step, Chain } from "@ephox/agar";
import { getTinymce } from "../../../main/ts/ephox/mcagar/loader/Globals";

const assertTinymceVersion = (tinymce, expectedMajor: number, expectedMinor: number) => {
  const major = parseInt(tinymce.majorVersion, 10);
  const minor = parseInt(tinymce.minorVersion.split('.')[0], 10);

  RawAssertions.assertEq('Not expected major', expectedMajor, major);
  RawAssertions.assertEq('Not expected minor', expectedMinor, minor);
};

const assertVersion = (expectedMajor: number, expectedMinor: number) => {
  const tinymce = getTinymce().getOrDie('Failed to get global tinymce');
  assertTinymceVersion(tinymce, expectedMajor, expectedMinor);
};

const sAssertVersion = (expectedMajor: number, expectedMinor: number) => {
  return Step.sync(() => assertVersion(expectedMajor, expectedMinor));
};

const cAssertEditorVersion = (expectedMajor: number, expectedMinor: number) => {
  return Chain.op<any>((editor) => assertTinymceVersion(editor.editorManager, expectedMajor, expectedMinor));
};

export {
  assertVersion,
  sAssertVersion,
  cAssertEditorVersion
}