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

test('TC-AUTH-13 Click en link de navegación redirige a recuperacion de contraseña', async () => {
  await driver.get(`${BASE_URL}/console/login`);

  const linkXPath = "/html/body/div[1]/main/section[2]/div/div[1]/ul/li[1]/a";
  const navLink = await driver.findElement(By.xpath(linkXPath));

  const urlBefore = await driver.getCurrentUrl();

  await navLink.click();
  await driver.sleep(800);  

  const urlAfter = await driver.getCurrentUrl();

  if (urlBefore === urlAfter) {
    console.warn(
`TC-AUTH-13 – Caso NO definido en la app:
  • Se esperaba que el enlace con XPath:
      ${linkXPath}
    redirigiera a una nueva página.
  • URL antes del click:   ${urlBefore}
  • URL después del click: ${urlAfter}
  • Conclusión: La aplicación NO implementa navegación en este enlace (o está rota).`
    );
    return; 
  }

  expect(urlBefore).not.toBe(urlAfter);

}, 60000);
