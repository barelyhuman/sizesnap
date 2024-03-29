#!/usr/bin/env node

export { SizeSnap } from './api';

import { SizeSnap } from './api';
import { SNAPSHOT_FILE } from './constants';
import { info, success, warn } from '../../../lib/loggers';

export function generate({
  log = true,
  table = false,
  write = true,
  markdown = false,
} = {}) {
  const args = process.argv.slice(2);

  // deprecations
  if (args.indexOf('table') > -1 && args.indexOf('--table') == -1) {
    warn('\nDeprecated, use `--table` instead\n');
  }

  /**
   * - create a new instance using `new`
   * - read the default config (`package.json`)
   * - size the files that were found from the read config or provide with absolute paths a an arg
   * eg:
   *  sizeFiles(["some/file/path"])
   **/

  if (args.indexOf('table') > -1 || args.indexOf('--table') > -1) {
    log = false;
    table = true;
  }

  if (args.indexOf('--markdown') > -1) {
    markdown = true;
  }

  !markdown ? info('Reading Config') : null;

  const sizeSnap = new SizeSnap().readConfig().sizeFiles();

  /**
   * Now create a snapshot from the files that've been read
   */
  sizeSnap.generateSnapshot({ log });

  /**
   * `value` is a tail function for the builder
   * which means, you can't chain it anymore
   * // the `value` function is async
   * and will need you to await the request or use the `thenable` chain
   * eg:
   *  sizeSnap.value()
   *    .then((x) => console.log({ x }));
   */

  /**
   * If table was requested, use the `tablePrint` to print a table using the provided printer
   * default printer is `console.log`, you can send through anything else
   * eg:
   * tablePrint(process.stdout.write)
   */
  if (table && !markdown) {
    sizeSnap.tablePrint();
  }

  /**
   * If table was requested with markdown, use the `markdownTablePrint` to print a table using the provided printer
   * default printer is `console.log`, you can send through anything else
   * eg:
   * markdownTablePrint(process.stdout.write)
   */
  if (markdown && table) {
    sizeSnap.markdownTablePrint();
  }

  /**
   * If write is true then generate a file that capture the JSON snapshot
   * defaults to `.sizesnap.json`, can be changed to whatever you want
   * eg:
   * writeSnapshot("path/to/snapshot/file.json")
   */
  if (write) {
    sizeSnap.writeSnapshot().then(() => {
      !markdown ? success(`Generated ${SNAPSHOT_FILE}`) : null;
    });
  }
}

if (require.main === module) {
  generate();
}
