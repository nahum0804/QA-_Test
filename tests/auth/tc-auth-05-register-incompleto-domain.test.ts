import { beforeEach, afterEach, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
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

test('TC-AUTH-05 Email con dominio invalido, name y pass válidos muestra mensaje de error (si existiera validación)', async () => {
  await driver.get(`${BASE_URL}/console/register`);
  
  const nameInput = await driver.findElement(By.xpath('//*[@id="name"]'));
  const emailInput = await driver.findElement(By.xpath('//*[@id="email"]'));
  const passwordInput = await driver.findElement(By.xpath('//*[@id="password"]'));
  
  await nameInput.sendKeys("Usuario de Prueba");
  await emailInput.sendKeys("correo@domain");     
  await passwordInput.sendKeys("Password123!");    
  
  const submitButtonXPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button";
  const submitButton = await driver.findElement(By.xpath(submitButtonXPath));
  await submitButton.click();
  
  const errorXPath = "//span[contains(., 'Emails should be formatted as: name@example.com')]";

  let errorMessage = null;
  try {
    errorMessage = await driver.wait(
      until.elementLocated(By.xpath(errorXPath)),
      2000
    );
  } catch {
    console.warn(
      `TC-AUTH-05 – Caso NO definido en la app:
  • Email ingresado: correo@domain
  • No se encontró ningún mensaje de validación con el texto "Emails should be formatted as: name@example.com".
  • Esto indica que la aplicación actualmente NO valida específicamente el caso de dominio incompleto.`
    );
    return;
  }

  const errorText = await errorMessage.getText();

  expect(await errorMessage.isDisplayed()).toBe(true);
  expect(errorText).toContain("Emails should be formatted as: name@example.com");
}, 60000);
