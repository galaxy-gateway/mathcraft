#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Bump the version in deno.json following semver.
 *
 * Usage:
 *   deno task bump patch   # 0.1.0 → 0.1.1
 *   deno task bump minor   # 0.1.0 → 0.2.0
 *   deno task bump major   # 0.1.0 → 1.0.0
 *   deno task bump 1.2.3   # set exact version
 */

const DENO_JSON = "deno.json";

const arg = Deno.args[0];
if (!arg) {
  console.error("Usage: deno task bump <patch|minor|major|x.y.z>");
  Deno.exit(1);
}

const text = await Deno.readTextFile(DENO_JSON);
const config = JSON.parse(text);
const current: string = config.version;

if (!current) {
  console.error('No "version" field found in deno.json');
  Deno.exit(1);
}

const [major, minor, patch] = current.split(".").map(Number);
let next: string;

switch (arg) {
  case "patch":
    next = `${major}.${minor}.${patch + 1}`;
    break;
  case "minor":
    next = `${major}.${minor + 1}.0`;
    break;
  case "major":
    next = `${major + 1}.0.0`;
    break;
  default:
    if (!/^\d+\.\d+\.\d+$/.test(arg)) {
      console.error(`Invalid version: "${arg}". Expected patch|minor|major|x.y.z`);
      Deno.exit(1);
    }
    next = arg;
}

config.version = next;
await Deno.writeTextFile(DENO_JSON, JSON.stringify(config, null, 2) + "\n");

console.log(`${current} → ${next}`);
