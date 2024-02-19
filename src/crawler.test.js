import { Crawler } from "./crawler.js";

class CaptureJob {
  async run({ crawler, page }) {
    await page.goto("https://www.google.com");
    crawler.infoSync("job/goolge navigated");

    await page.screenshot({ path: "screenshot.png", fullPage: true });
    crawler.infoSync("job/google captured");

    await page.waitForTimeout(5000);
  }
}

const config = {
  playwright: {
    channel: "chrome",
    headless: false,
  },
};

const jobs = {
  capture: new CaptureJob(),
};

new Crawler(config, jobs).run(["capture"]);
