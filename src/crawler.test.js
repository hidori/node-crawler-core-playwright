import { Crawler } from "./crawler.js";

class GoogleCaptureJob {
  async run({ crawler, page }) {
    await page.goto("https://www.google.com");
    crawler.infoSync("google/capture: navigated");

    await page.screenshot({ path: "screenshot.png", fullPage: true });
    crawler.infoSync("google/capture: captured");

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
  "google/capture": new GoogleCaptureJob(),
};

new Crawler(config, jobs).run(["google/capture"]);
