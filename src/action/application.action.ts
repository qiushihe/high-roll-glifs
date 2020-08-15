import { createPromisedAction } from "/src/util/action.util";
import { invoke } from "/src/util/function.util";

export const BOOT = "APP/BOOT";

export const boot = createPromisedAction(BOOT, [], invoke);
