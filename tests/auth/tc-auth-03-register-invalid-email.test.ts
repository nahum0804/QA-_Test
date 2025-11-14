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

test('TC-AUTH-03 Email sin formato válido muestra mensaje de error', async () => {
  // Navegar a la página de registro
  await driver.get(`${BASE_URL}/console/login`);
  
  // Rellenar el formulario con email sin @
 const emailInput = await driver.findElement(By.xpath('//*[@id="email"]'));
 const passwordInput = await driver.findElement(By.xpath('//*[@id="password"]'));

  await emailInput.sendKeys("correosinformato");
  await passwordInput.sendKeys("Password123!");
  
  // Hacer clic en el botón Sign up
  const submitButton = await driver.findElement(By.xpath("/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button"));
  await submitButton.click();
  
  // Verificar mensaje de error de formato
  const errorMessage = await driver.findElement(By.xpath("/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div[1]/div[1]/span[2]"));
  const errorText = await errorMessage.getText();
  
  expect(await errorMessage.isDisplayed()).toBe(true);
  expect(errorText).toContain("Emails should be formatted as name@example.com");
}, 60000);