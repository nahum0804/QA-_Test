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

test('TC-AUTH-10 Sign in con email inválido muestra error', async () => {
  await driver.get(`${BASE_URL}/console/login`);
  await driver.sleep(1000);
  
  // Rellenar formulario
  const emailInput = await driver.findElement(By.css('input[type="email"], input[placeholder*="Email"]'));
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  
  await emailInput.sendKeys("user@domain");
  await passwordInput.sendKeys("Password123!");
  
  // Click Sign in
  const signInButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign in')]"));
  await signInButton.click();
  await driver.sleep(500);
  
  // Verificar mensaje de error
  const errorMessage = await driver.findElement(By.xpath("//span[contains(text(), 'formato inválido') or contains(text(), 'invalid') or contains(text(), 'no envía request')]"));
  expect(await errorMessage.isDisplayed()).toBe(true);
}, 60000);