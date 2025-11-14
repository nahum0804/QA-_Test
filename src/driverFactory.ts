import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export async function createDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  // options.addArguments('--headless');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  await driver.manage().window().maximize();
  await driver.manage().setTimeouts({ implicit: 10000 });
  
  return driver; 
}