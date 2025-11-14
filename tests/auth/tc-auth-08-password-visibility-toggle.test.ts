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

test('TC-AUTH-08 Icono ojo alterna visibilidad del password', async () => {
  await driver.get(`${BASE_URL}/console/login`);
  
  // Ir a Sign up
  const signUpLink = await driver.findElement(By.linkText("Sign up"));
  await signUpLink.click();
  await driver.sleep(1000);
  
  // Encontrar campo password
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  
  // Ingresar texto
  await passwordInput.sendKeys("MiPassword123");
  
  // Verificar que el tipo es "password" (oculto)
  let inputType = await passwordInput.getAttribute('type');
  expect(inputType).toBe('password');
  
  // Encontrar y hacer clic en el icono del ojo
  const eyeIcon = await driver.findElement(By.css('button[type="button"] svg, .eye-icon, button:has(svg)'));
  await eyeIcon.click();
  await driver.sleep(300);
  
  // Verificar que el tipo cambió a "text" (visible)
  inputType = await passwordInput.getAttribute('type');
  expect(inputType).toBe('text');
  
  // Hacer clic nuevamente
  await eyeIcon.click();
  await driver.sleep(300);
  
  // Verificar que volvió a "password" (oculto)
  inputType = await passwordInput.getAttribute('type');
  expect(inputType).toBe('password');
}, 60000);