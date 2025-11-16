import { beforeEach, afterEach, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';

jest.setTimeout(60000);

let driver: WebDriver;

beforeEach(async () => {
  driver = await createDriver();
}, 60000);

afterEach(async () => {
  if (driver) {
    await driver.quit();
  }
}, 30000);

test('TC-AUTH-07 Password de 8 caracteres válidos no muestra error', async () => {
  await driver.get(`${BASE_URL}/console/register`);
  
  const nameInput = await driver.findElement(By.xpath('//*[@id="name"]'));
  const emailInput = await driver.findElement(By.xpath('//*[@id="email"]'));
  const passwordInput = await driver.findElement(By.xpath('//*[@id="password"]'));
  
  await nameInput.sendKeys("Usuario de Prueba");
  await emailInput.sendKeys("correo@123.com");  
  await passwordInput.sendKeys("Password123!");      
  
  const submitButtonXPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button";
  const submitButton = await driver.findElement(By.xpath(submitButtonXPath));
  await submitButton.click();

  const error1XPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div[1]/div[2]/span[2]"; 
  const error2XPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div[2]/div[2]/span[2]"; 
  const error3XPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div[3]/div[2]/span[2]"; 

  const errorXPaths = [error1XPath, error2XPath, error3XPath];

  for (const xp of errorXPaths) {
    const elements = await driver.findElements(By.xpath(xp));
    
    if (elements.length === 0) continue;

    for (const el of elements) {
      const displayed = await el.isDisplayed();
      const text = (await el.getText()).trim();

      expect(displayed && text !== "").toBe(false);
    }
  }
}, 60000);