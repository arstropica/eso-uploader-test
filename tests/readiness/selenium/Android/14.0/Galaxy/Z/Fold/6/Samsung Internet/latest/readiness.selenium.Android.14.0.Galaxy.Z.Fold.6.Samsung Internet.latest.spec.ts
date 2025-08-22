// tests/readiness/selenium/Android/14.0/Galaxy/Z.Fold.6/Samsung Internet/latest/readiness.selenium.Android.14.0.Galaxy.Z.Fold.6.Samsung Internet.latest.spec.ts
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
        browserName: "Samsung Internet",
        browserVersion: "latest",
        "bstack:options": {
          platformName: "Android",
          deviceName: "Galaxy Z Fold 6",
          osVersion: "14.0",
          realMobile: true,
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.Android.14.0.Galaxy.Z.Fold.6.Samsung Internet.latest.Readiness",
          sessionName: "Android 14.0 / Galaxy Z Fold 6 / Samsung Internet latest",
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
