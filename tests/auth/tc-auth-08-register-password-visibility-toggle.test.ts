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
  await driver.get(`${BASE_URL}/console/register`);


  const passwordLocator = By.id('password');
  let passwordInput = await driver.findElement(passwordLocator);

  await passwordInput.sendKeys("MiPassword123");

  let inputType = await passwordInput.getAttribute('type');
  expect(inputType).toBe('password');

  const eyeIcon = await driver.findElement(
    By.xpath('/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div[3]/div[1]/button/i')
  );
  
  await eyeIcon.click();
  await driver.sleep(300);

  passwordInput = await driver.findElement(passwordLocator);
  inputType = await passwordInput.getAttribute('type');
  expect(inputType).toBe('text');

  await eyeIcon.click();
  await driver.sleep(300);

  passwordInput = await driver.findElement(passwordLocator);
  inputType = await passwordInput.getAttribute('type');
  expect(inputType).toBe('password');
}, 60000);
