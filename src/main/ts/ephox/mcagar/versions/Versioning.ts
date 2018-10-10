import { Global } from "@ephox/katamari";

const getMajorVersion = () => {
  const tinymce = Global.tinymce;
  return parseInt(tinymce.majorVersion);
};

const isModern = () => {
  return getMajorVersion() < 5;
}

const isSilver = () => {
  return getMajorVersion() >= 5;
}

export {
  isModern,
  isSilver
}