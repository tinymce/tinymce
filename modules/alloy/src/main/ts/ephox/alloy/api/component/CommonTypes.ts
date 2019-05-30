import { AlloyComponent } from "./ComponentApi";
import { Result } from "@ephox/katamari";

export type LazySink = (comp: AlloyComponent) => Result<AlloyComponent, any>