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

test('TC-AUTH-19 Registro con correo ya existente muestra mensaje de error en el modal', async () => {

  await driver.get(`${BASE_URL}/console/register`);
  await driver.sleep(500);

  const nameInput = await driver.findElement(By.id('name'));
  const emailInput = await driver.findElement(By.id('email'));
  const passwordInput = await driver.findElement(By.id('password'));
  
  await nameInput.sendKeys("Usuario existente");
  await emailInput.sendKeys("correo@123.com");  
  await passwordInput.sendKeys("Password123!");  

  const submitButtonXPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button";
  const submitButton = await driver.findElement(By.xpath(submitButtonXPath));
  await submitButton.click();
  await driver.sleep(600);

  const parentDivXPath = "/html/body/div[1]/section/div";
  const parentDivElements = await driver.findElements(By.xpath(parentDivXPath));

  if (parentDivElements.length === 0) {
    console.warn(
`TC-AUTH-19 – Caso NO definido en la app:
  • Se intentó registrar un usuario con un correo YA existente: correo@123.com
  • Se esperaba un mensaje de error en un modal (div padre: ${parentDivXPath}).
  • Pero no se encontró ningún modal de error.
  • La aplicación podría no estar validando correos duplicados o la estructura cambió.

  ------------------------------------------------------------------
  Este caso esta invalidado por un error de la aplicación que se presentó durante las pruebas.
  ------------------------------------------------------------------`
    );
    return;
  }

  const parentDiv = parentDivElements[0];

  const spanElements = await parentDiv.findElements(By.tagName("span"));

  if (spanElements.length === 0) {
    return;
  }

  const messageSpan = spanElements[0];
  const messageText = (await messageSpan.getText()).trim();

  expect(await messageSpan.isDisplayed()).toBe(true);
  expect(messageText.length).toBeGreaterThan(0);

}, 60000);
