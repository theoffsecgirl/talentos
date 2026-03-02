import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const isDev = process.env.NODE_ENV === "development";

export async function generatePDFBuffer(html: string): Promise<Buffer> {
  let browser;

  try {
    if (isDev) {
      // Desarrollo local: usa Puppeteer estándar
      const puppeteerDev = await import("puppeteer");
      browser = await puppeteerDev.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      // Producción: usa chromium optimizado para serverless
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}
