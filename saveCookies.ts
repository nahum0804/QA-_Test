import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import fs from 'fs';

(async () => {
  const options = new chrome.Options();
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  await driver.get('http://localhost:5173/console/auth/login');

  console.log("👉 Loguéate manualmente en Appwrite...");
  await new Promise((resolve) => setTimeout(resolve, 20000)); // 20 sec para que te loguees

  const cookies = await driver.manage().getCookies();
  fs.writeFileSync('cookies.json', JSON.stringify(cookies));

  console.log("✅ Cookies guardadas!");
  await driver.quit();
})();
