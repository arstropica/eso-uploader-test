// tests/readiness/selenium/Android/4.2/{{device_brand}}/{{device_model}}/Uc Browser/latest/readiness.selenium.Android.4.2.{{device_brand}}.{{device_model}}.Uc Browser.latest.spec.ts
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
          os: "Android",
          osVersion: "4.2",
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.Android.4.2.{{device_brand}}.{{device_model}}.Uc Browser.latest.Readiness",
          sessionName: "Android 4.2 / {{device}} / Uc Browser latest",
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
