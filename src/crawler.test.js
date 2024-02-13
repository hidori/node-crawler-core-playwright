import { Crawler } from "./crawler.js";

class CaptureJob {
  async run({ host, page }) {
    await page.goto("https://www.google.com");
    host.infoSync(`navigated`);

    await page.screenshot({ path: "screenshot.png", fullPage: true });
    host.infoSync(`captured`);

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
