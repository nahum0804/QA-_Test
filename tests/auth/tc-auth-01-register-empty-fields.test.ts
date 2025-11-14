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

test('TC-AUTH-01 Registro con todos los campos vacíos muestra mensajes de error', async () => {
  await driver.get(`${BASE_URL}/console/login`);
  
  // clic en el botón de submit
  const submitButtonXPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button";
  const submitButton = await driver.findElement(By.xpath(submitButtonXPath));
  await submitButton.click();
  
  const error1XPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div[1]/div[2]/span[2]";
  const error2XPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div[2]/div[2]/span[2]";
  
  const error1 = await driver.findElement(By.xpath(error1XPath));
  const error2 = await driver.findElement(By.xpath(error2XPath));
  
  
  const errorsAreVisible = (await error1.isDisplayed()) && (await error2.isDisplayed());
  expect(errorsAreVisible).toBe(true);
}, 60000);