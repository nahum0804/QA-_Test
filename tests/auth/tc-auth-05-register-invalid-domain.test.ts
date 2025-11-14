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

test('TC-AUTH-05 Email con dominio incompleto muestra error', async () => {
  await driver.get(`${BASE_URL}/console/login`);
  
  // Ir a Sign up
  const signUpLink = await driver.findElement(By.linkText("Sign up"));
  await signUpLink.click();
  await driver.sleep(1000);
  
  // Rellenar formulario
  const emailInput = await driver.findElement(By.css('input[type="email"], input[placeholder*="Email"]'));
  const nameInput = await driver.findElement(By.css('input[placeholder*="Name"]'));
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  
  await emailInput.sendKeys("correo@domain");
  await nameInput.sendKeys("Usuario Prueba");
  await passwordInput.sendKeys("Password123!");
  
  // Click Sign up
  const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign up')]"));
  await submitButton.click();
  await driver.sleep(500);
  
  // Verificar mensaje de error
  const errorMessage = await driver.findElement(By.xpath("//span[contains(text(), 'Invalid email address')]"));
  expect(await errorMessage.isDisplayed()).toBe(true);
}, 60000);