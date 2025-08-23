// throttledReporter.js
class ThrottledReporter {
  constructor(globalConfig, options) {
    // ms to wait between files; can be set via options or env
    this.delayMs =
      Number(options?.delayMs ?? process.env.JEST_FILE_DELAY_MS ?? 1500);

    this._remaining = 0;
  }

  onRunStart(results) {
    // total test suites to run
    this._remaining = results.numTotalTestSuites || 0;
  }

  async onTestResult() {
    // one file just finished
    this._remaining = Math.max(0, this._remaining - 1);

    // skip delay after the final file (optional)
    if (this._remaining === 0) return;

    await new Promise((r) => setTimeout(r, this.delayMs));
  }
}

module.exports = ThrottledReporter;
