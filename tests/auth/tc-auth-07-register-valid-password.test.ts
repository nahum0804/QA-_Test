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
  await driver.get(`${BASE_URL}/console/login`);
  
  // Ir a Sign up
  const signUpLink = await driver.findElement(By.linkText("Sign up"));
  await signUpLink.click();
  await driver.sleep(1000);
  
  // Rellenar formulario
  const emailInput = await driver.findElement(By.css('input[type="email"], input[placeholder*="Email"]'));
  const nameInput = await driver.findElement(By.css('input[placeholder*="Name"]'));
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  
  await emailInput.sendKeys("usuario@ejemplo.com");
  await nameInput.sendKeys("Usuario Prueba");
  await passwordInput.sendKeys("abc12345");
  
  // Click Sign up
  const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign up')]"));
  await submitButton.click();
  await driver.sleep(500);
  
  // Verificar que NO hay mensajes de error de password
  const errorElements = await driver.findElements(By.xpath("//span[contains(text(), 'Password must be at least 8 characters long')]"));
  expect(errorElements.length).toBe(0);
}, 60000);