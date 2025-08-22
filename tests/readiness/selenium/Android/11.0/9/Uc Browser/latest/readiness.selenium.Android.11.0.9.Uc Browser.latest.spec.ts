// tests/readiness/selenium/Android/11.0/9/generic/Uc Browser/latest/readiness.selenium.Android.11.0.9.generic.Uc Browser.latest.spec.ts
import { uploaderReadinessTest } from "@shared/shared.selenium";
import { Builder, WebDriver } from "selenium-webdriver";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const timeout = 60000;
let driver: WebDriver;

describe("Single BrowserStack test", function () {

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer("https://hub.browserstack.com/wd/hub")
      .withCapabilities({
        browserName: "Uc Browser",
        browserVersion: "latest",
        "bstack:options": {
          platformName: "Android",
          deviceName: "9",
          osVersion: "11.0",
          realMobile: true,
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.Android.11.0.9.generic.Uc Browser.latest.Readiness",
          sessionName: "Android 11.0 / 9 / Uc Browser latest",
          video: false,
          networkLogs: true,
          consoleLogs: "verbose",
        },
      })
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  it("should create the uploader instance and initialize Vips", async () => {
    await uploaderReadinessTest(driver)();
  }, timeout);
  });
