import { RawAssertions, Step } from "@ephox/agar";
import { getTinymce } from "../../../main/ts/ephox/mcagar/loader/Globals";

const assertVersion = (expectedMajor: number, expectedMinor: number) => {
  const tinymce = getTinymce().getOrDie('Failed to get global tinymce');
  const major = parseInt(tinymce.majorVersion, 10);
  const minor = parseInt(tinymce.minorVersion.split('.')[0], 10);

  RawAssertions.assertEq('Not expected major', expectedMajor, major);
  RawAssertions.assertEq('Not expected minor', expectedMinor, minor);
};

const sAssertVersion = (expectedMajor: number, expectedMinor: number) => {
  return Step.sync(() => assertVersion(expectedMajor, expectedMinor));
};

export {
  assertVersion,
  sAssertVersion
}