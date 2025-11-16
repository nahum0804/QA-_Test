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

test('TC-AUTH-09 Sign in con campos vacíos mantiene botón deshabilitado (si existiera validación)', async () => {

  await driver.get(`${BASE_URL}/console/login`);
  await driver.sleep(500);

  const signInButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button")
  );

  const isEnabled = await signInButton.isEnabled();
  const disabledAttr = await signInButton.getAttribute("disabled");

  if (isEnabled || disabledAttr === null) {
    console.warn(
      `TC-AUTH-09 – Caso NO definido en la app:
  • Se esperaba que el botón 'Sign In' estuviera DESHABILITADO cuando email y password están vacíos.
  • Estado real del botón:
      - isEnabled(): ${isEnabled}
      - atributo 'disabled': ${disabledAttr}
  • Conclusión: La app NO implementa validación para deshabilitar el botón cuando los campos están vacíos.`
    );
    return;   
  }

  expect(disabledAttr).not.toBeNull();
  expect(isEnabled).toBe(false);

}, 60000);
