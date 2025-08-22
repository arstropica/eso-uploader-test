// tests/readiness/selenium/Windows/7/{{device_brand}}/{{device_model}}/Ie/latest/readiness.selenium.Windows.7.{{device_brand}}.{{device_model}}.Ie.latest.spec.ts
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
        browserVersion: "latest",
        "bstack:options": {
          os: "Windows",
          osVersion: "7",
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.Windows.7.{{device_brand}}.{{device_model}}.Ie.latest.Readiness",
          sessionName: "Windows 7 / {{device}} / Ie latest",
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
