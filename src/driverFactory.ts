// src/driverFactory.ts
import { WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import * as chromedriver from 'chromedriver';

export async function createDriver(): Promise<WebDriver> {
  console.log('🔧 Iniciando createDriver...');

  const options = new chrome.Options();

  // Puedes probar primero SIN headless; si da problemas, lo activamos
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--window-size=1280,720');

  // Le decimos explícitamente a Selenium dónde está chromedriver
  const service = new chrome.ServiceBuilder(chromedriver.path).build();

  console.log('🚗 Creando sesión de ChromeDriver con path:', chromedriver.path);

  // En vez de new Builder().forBrowser('chrome')...
  const driver: WebDriver = chrome.Driver.createSession(options, service);

  console.log('✅ Driver creado');

  await driver.manage().setTimeouts({ implicit: 10000 });

  return driver;
}
