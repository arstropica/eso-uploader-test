// tests/readiness/selenium/Android/2.3/Droid/Razr/Firefox/latest/readiness.selenium.Android.2.3.Droid.Razr.Firefox.latest.spec.ts
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
        browserName: "Firefox",
        browserVersion: "latest",
        "bstack:options": {
          platformName: "Android",
          deviceName: "Droid Razr",
          osVersion: "2.3",
          realMobile: true,
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.Android.2.3.Droid.Razr.Firefox.latest.Readiness",
          sessionName: "Android 2.3 / Droid Razr / Firefox latest",
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
