const { test } = require("uvu");
const assert = require("uvu/assert");
const { SizeSnap } = require("../dist");
const { readFileSync } = require("fs");
const { join } = require("path");
const { spawnSync } = require("child_process");

const bin = "./dist/index.js";
const rootDir = join(__dirname, "..");

const fixtures = join(__dirname, "helpers");
const rejson = (j) => JSON.stringify(JSON.parse(j));
const normalize = (c) => {
  if (typeof c === "object") {
    c = JSON.stringify(c);
  }
  return rejson(c.trim().replace(/\r?\n/g, "\n"));
};

function exec(cwd, src, flags = []) {
  let args = [bin].concat(src || [], flags);
  return spawnSync("node", args, { cwd });
}

test("new SizeSnap", () => {
  const newInstance = new SizeSnap();
  assert.instance(newInstance, SizeSnap);
});

test("read config", () => {
  const snap = new SizeSnap();
  const config = snap.readConfig("package.json").config;
  const fix = readFileSync(join(fixtures, "config.json"), "utf8");
  assert.fixture(
    normalize({
      sizesnap: config,
    }),
    normalize(fix)
  );
});

test("execution normal", () => {
  let pid = exec(rootDir);
  //   Wait on execution
  setTimeout(() => {
    assert.ok(pid.stdout.length);
    assert.is(pid.status, 0);
  }, 0);
});

test("execution pretty", () => {
  let pid = exec(rootDir, null, "pretty");
  //   Wait on execution
  setTimeout(() => {
    assert.ok(pid.stdout.length);
    assert.is(pid.status, 0);
  }, 0);
});

test.run();
