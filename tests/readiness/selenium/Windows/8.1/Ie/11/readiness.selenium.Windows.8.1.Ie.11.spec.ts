// tests/readiness/selenium/Windows/8.1/{{device_brand}}/{{device_model}}/Ie/11/readiness.selenium.Windows.8.1.{{device_brand}}.{{device_model}}.Ie.11.spec.ts
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
        browserName: "Ie",
        browserVersion: "11",
        "bstack:options": {
          os: "Windows",
          osVersion: "8.1",
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.Windows.8.1.{{device_brand}}.{{device_model}}.Ie.11.Readiness",
          sessionName: "Windows 8.1 / {{device}} / Ie 11",
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
