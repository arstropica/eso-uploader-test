// tests/readiness.selenium.spec.js
import { Builder, By, logging, until, WebDriver } from "selenium-webdriver";

type ReadinessState =
  | "NO_ERROR"
  | "HARMLESS_ERROR"
  | "WITH_ERROR"
  | "NO_OUTPUT";

const TEST_URL =
  process.env.TEST_URL ||
  "https://akin.estatesales.org/xbrowser/index-test.html";
const TEXTAREA_SELECTOR = "#consoleSink";

/**
 * Classify the readiness state based on the provided text.
 * @param {string} fullText - The combined textarea and console text.
 * @returns {ReadinessState} - The classified readiness state.
 */
function classifyReadiness(fullText: string): ReadinessState {
  const t = fullText.toLowerCase();

  if (t.length == 0) {
    return "NO_OUTPUT";
  }

  // WITH_ERROR: hard VIPS init failure / explicit [error]
  if (
    /\[error\]/i.test(fullText) ||
    /failed to initialize vips|your browser does not support vips/i.test(t)
  ) {
    return "WITH_ERROR";
  }

  // HARMLESS_ERROR: structuredClone fallback noise but uploader continues
  if (
    /structuredclone failed/i.test(
      fullText
    ) ||
    /datacloneerror/i.test(t)
  ) {
    return "HARMLESS_ERROR";
  }

  // Otherwise assume clean init
  return "NO_ERROR";
}

/**
 * Get console log strings from the browser.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @returns {Promise<string[]>} - An array of console log strings.
 */
async function getConsoleLogStrings(driver: WebDriver): Promise<string[]> {
  try {
    // Works locally on Chrome/Edge; on BrowserStack it may or may not be available across all browsers.
    const entries = await driver.manage().logs().get(logging.Type.BROWSER);
    return entries.map(
      (e) =>
        `[${e.level && e.level.name ? e.level.name : e.level}] ${e.message}`
    );
  } catch {
    return [];
  }
}

describe("Uploader readiness (Selenium via BrowserStack SDK)", () => {
  let driver: WebDriver;

  beforeAll(async () => {
    // No .forBrowser('chrome'), no hub URL — the SDK supplies all of that per run.
    driver = await new Builder().build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test("Uploader readiness is classified and reported to BrowserStack SDK)", async () => {
    await driver.get(TEST_URL);

    const ta = await driver.wait(
      until.elementLocated(By.css(TEXTAREA_SELECTOR)),
      15000
    );
    await driver.wait(until.elementIsVisible(ta), 5000);

    let taOutput =
      (await ta.getAttribute("value")) || (await ta.getText()) || "";
    taOutput = taOutput.trim();

    expect(taOutput.length).toBeGreaterThan(0);

    // Collect console logs (best-effort) and combine
    const consoleMessages = await getConsoleLogStrings(driver);
    const combined = [taOutput, ...consoleMessages].join("\n");

    const state = classifyReadiness(combined);
    // breadcrumb for CI logs
    // eslint-disable-next-line no-console
    console.log(`Readiness state: ${state}`);

    // Enforce result (SDK will auto-mark the session based on pass/fail)
    expect(state).not.toBe("WITH_ERROR");
    expect(state).not.toBe("NO_OUTPUT");

    const readinessState = classifyReadiness(taOutput);
    expect(combined).toMatch(
      /mimeType\.uploader|Registering plugin for MIME type/i
    );
  }, 120000);
});
