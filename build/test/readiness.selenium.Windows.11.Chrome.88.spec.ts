// tests/readiness/selenium/{{os}}/{{os_version}}/{{device_brand}}/{{device_model}}/{{browser}}/{{browser_version}}/readiness.selenium.{{os}}.{{os_version}}.{{device_brand}}.{{device_model}}.{{browser}}.{{browser_version}}.spec.ts
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
        browserName: "{{browser}}",
        browserVersion: "{{browser_version}}",
        "bstack:options": {
          os: "{{os}}",
          osVersion: "{{os_version}}",
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.{{os}}.{{os_version}}.{{device_brand}}.{{device_model}}.{{browser}}.{{browser_version}}.Readiness",
          sessionName: "{{os}} {{os_version}} / {{device}} / {{browser}} {{browser_version}}",
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
