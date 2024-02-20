"use strict";

import { Logger } from "@hidori/logger";
import { chromium } from "playwright";

const defaultConfg = {
  logger: new Logger(),
  playwright: {
    channel: "chrome",
    headless: false,
  },
};

export class Crawler {
  constructor(config, jobs) {
    this.#config = Object.assign(Object.assign({}, defaultConfg), config);
    this.#jobs = jobs;
  }

  #config;
  #jobs;

  async run(keys) {
    try {
      this.infoSync("crawler: START");

      for (const key of keys) {
        if (!(key in this.#jobs)) {
          throw `crawler: unknown job '${key}'`;
        }
      }

      const browser = await chromium.launch(this.#config.playwright);

      try {
        const context = await browser.newContext();
        const page = await context.newPage();

        for (const key of keys) {
          this.infoSync(`crawler: START ${key}`);

          await this.#jobs[key].run({
            crawler: this,
            browser: browser,
            context: context,
            page: page,
          });
          await page.waitForTimeout(1000);

          this.infoSync(`crawler: END ${key}`);
        }
      } finally {
        browser.close();
      }

      this.infoSync("crawler: END");
    } catch (e) {
      this.errorSync(
        `crawler: FAILED\n${JSON.stringify(e, Object.getOwnPropertyNames(e))}`,
      );
      throw e;
    }
  }

  debugSync(text) {
    this.#config.logger.debugSync(text);
  }

  infoSync(text) {
    this.#config.logger.infoSync(text);
  }

  warnSync(text) {
    this.#config.logger.warnSync(text);
  }

  errorSync(text) {
    this.#config.logger.errorSync(text);
  }
}
