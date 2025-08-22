// tests/readiness/selenium/IOS/18/iPad/Pro.11.2021/Safari/latest/readiness.selenium.IOS.18.iPad.Pro.11.2021.Safari.latest.spec.ts
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
        browserName: "Safari",
        browserVersion: "latest",
        "bstack:options": {
          platformName: "IOS",
          deviceName: "iPad Pro 11 2021",
          osVersion: "18",
          realMobile: true,
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
          buildName: "Selenium.IOS.18.iPad.Pro.11.2021.Safari.latest.Readiness",
          sessionName: "IOS 18 / iPad Pro 11 2021 / Safari latest",
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
