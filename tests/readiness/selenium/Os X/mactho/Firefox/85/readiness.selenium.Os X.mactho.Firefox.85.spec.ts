// tests/readiness/selenium/Os X/mactho/{{device_brand}}/{{device_model}}/Firefox/85/readiness.selenium.Os X.mactho.{{device_brand}}.{{device_model}}.Firefox.85.spec.ts
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
        browserVersion: "85",
        "bstack:options": {
          os: "Os X",
          osVersion: "mactho",
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.Os X.mactho.{{device_brand}}.{{device_model}}.Firefox.85.Readiness",
          sessionName: "Os X mactho / {{device}} / Firefox 85",
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
