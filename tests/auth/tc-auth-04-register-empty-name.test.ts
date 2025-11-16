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

test('TC-AUTH-04 Name vacio muestra mensaje de error', async () => {
  
  await driver.get(`${BASE_URL}/console/register`);
  
  const nameInput = await driver.findElement(By.xpath('//*[@id="name"]'));
  const emailInput = await driver.findElement(By.xpath('//*[@id="email"]'));
  const passwordInput = await driver.findElement(By.xpath('//*[@id="password"]'));
  
  await nameInput.sendKeys("");
  await emailInput.sendKeys("correo@example.com");
  await passwordInput.sendKeys("Password123!");
 
  const submitButtonXPath = "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button";
  const submitButton = await driver.findElement(By.xpath(submitButtonXPath));
  await submitButton.click();
  
  const errorMessage = await driver.findElement(By.xpath("/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/div[1]/div[2]/span[2]"));
  const errorText = await errorMessage.getText();
  
  expect(await errorMessage.isDisplayed()).toBe(true);
  expect(errorText).toContain("This field is required");
}, 60000);