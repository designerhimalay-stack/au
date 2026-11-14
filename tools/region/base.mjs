// The URL base for this repo's region (region.json), with a trailing slash:
// "/" for us, "/au/", "/in/", "/uae/". Used by the audit and image tools.
import { readFileSync } from "node:fs";

const { region } = JSON.parse(readFileSync(new URL("../../region.json", import.meta.url), "utf8"));
export const BASE = region === "us" ? "/" : `/${region}/`;
