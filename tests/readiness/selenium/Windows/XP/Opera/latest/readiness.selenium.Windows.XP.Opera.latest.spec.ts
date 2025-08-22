// tests/readiness/selenium/Windows/XP/{{device_brand}}/{{device_model}}/Opera/latest/readiness.selenium.Windows.XP.{{device_brand}}.{{device_model}}.Opera.latest.spec.ts
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
        browserName: "Opera",
        browserVersion: "latest",
        "bstack:options": {
          os: "Windows",
          osVersion: "XP",
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.Windows.XP.{{device_brand}}.{{device_model}}.Opera.latest.Readiness",
          sessionName: "Windows XP / {{device}} / Opera latest",
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
