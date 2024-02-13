"use strict";

import { Logger } from "@hidori/logger";
import { chromium } from "playwright";

class JobHost {
  constructor(key, logger) {
    this.#key = key;
    this.#logger = logger;
  }

  #key;
  #logger;

  async info(data) {
    await this.#logger.info(`job/${this.#key} ${data}`);
  }

  infoSync(data) {
    this.#logger.infoSync(`job/${this.#key} ${data}`);
  }
}

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
    await this.#start("crawler", async () => {
      for (const key of keys) {
        if (!(key in this.#jobs)) {
          throw `unknown job '${key}'`;
        }
      }

      for (const key of keys) {
        await this.#start(`job/${key}`, async () => {
          await this.runJob(key, this.#jobs[key]);
        });
      }
    });
  }

  async #start(name, func) {
    this.#config.logger.infoSync(`${name} START`);

    try {
      await func();

      this.#config.logger.infoSync(`${name} END`);
    } catch (e) {
      this.#config.logger.errorSync(
        `${name} FAILED\n${JSON.stringify(e, Object.getOwnPropertyNames(e))}`,
      );
      throw e;
    }
  }

  async runJob(key, job) {
    const browser = await chromium.launch(this.#config.playwright);

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      await job.run({
        host: new JobHost(key, this.#config.logger),
        browser: browser,
        context: context,
        page: page,
      });
    } finally {
      browser.close();
    }
  }
}
