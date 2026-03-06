import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://nepalvotes.live', { waitUntil: 'networkidle2' });
  
  // Wait a moment for any dynamic data to load
  await new Promise(r => setTimeout(r, 2000));
  
  // Extract text content from the main dashboard area
  const content = await page.evaluate(() => {
    return document.body.innerText;
  });
  
  console.log(content.substring(0, 2000));
  
  await browser.close();
})();
