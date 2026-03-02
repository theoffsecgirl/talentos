import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';

export async function getBrowser() {
  // Vercel uses a read-only file system, so we need to use chrome-aws-lambda
  const executablePath = await chromium.executablePath;

  if (!executablePath) {
    // Fallback para desarrollo local
    throw new Error(
      'No se encontró Chrome. Instala chrome-aws-lambda o configura PUPPETEER_EXECUTABLE_PATH'
    );
  }

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });
}

export async function generatePDFFromURL(url: string): Promise<Buffer> {
  const browser = await getBrowser();
  
  try {
    const page = await browser.newPage();
    
    // Navegar a la URL
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Esperar un momento adicional para asegurar renderizado
    await page.waitForTimeout(1000);

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '1.5cm',
        left: '1.5cm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  
  try {
    const page = await browser.newPage();
    
    // Cargar HTML directamente
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Esperar renderizado
    await page.waitForTimeout(1000);

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '1.5cm',
        left: '1.5cm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
