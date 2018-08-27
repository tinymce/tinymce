import { UnitTest } from "@ephox/bedrock";
import { Pipeline } from "../../../../main/ts/ephox/agar/api/Main";

UnitTest.asynctest('LogTest', (success, failure) => {

  Pipeline.async({}, [

  ], success, failure);

});