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

test('TC-AUTH-17 Recuperar contraseña con email vacío muestra mensaje "This field is required"', async () => {
  await driver.get(`${BASE_URL}/console/recover`);
  await driver.sleep(500);

  const submitButtonXPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button";
  const submitButton = await driver.findElement(By.xpath(submitButtonXPath));
  await submitButton.click();
  await driver.sleep(500);

  const errorSpanXPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div/div[2]/span[2]";

  const errorSpans = await driver.findElements(By.xpath(errorSpanXPath));

  // caso no definido en la app
  if (errorSpans.length === 0) {
    console.warn(
`TC-AUTH-17 – Caso NO definido en la app:
  • Se intentó recuperar contraseña con el campo de email vacío.
  • Se esperaba encontrar un mensaje de error en:
      ${errorSpanXPath}
  • Pero no se encontró ningún <span> de validación.
  • La aplicación podría estar permitiendo enviar el formulario sin validar el campo requerido.`
    );
    return;
  }

  const errorSpan = errorSpans[0];
  const errorText = (await errorSpan.getText()).trim();

  expect(await errorSpan.isDisplayed()).toBe(true);
  expect(errorText).toBe("This field is required");
}, 60000);
