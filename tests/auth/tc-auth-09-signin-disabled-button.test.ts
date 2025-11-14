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

test('TC-AUTH-09 Sign in con campos vacíos mantiene botón deshabilitado', async () => {
  await driver.get(`${BASE_URL}/console/login`);
  await driver.sleep(1000);
  
  // Encontrar el botón Sign in
  const signInButton = await driver.findElement(By.xpath("//button[contains(text(), 'Sign in')]"));
  
  // Verificar que el botón está deshabilitado
  const isDisabled = await signInButton.getAttribute('disabled');
  expect(isDisabled).toBeTruthy();
  
  // Alternativamente, verificar con isEnabled()
  const isEnabled = await signInButton.isEnabled();
  expect(isEnabled).toBe(false);
}, 60000);