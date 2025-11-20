import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(180000);

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
}, 180000);

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
}, 60000);

// MISMOS valores que en la 60A
const PROJECT_NAME = 'Proyecto Persistencia QA 60';
const HOSTNAME = 'persistencia60.ejemplo.com';

test('TC-PROJ-60B Persistencia de proyecto y plataforma Web tras reinicio', async () => {
  // PRECONDICIÓN:
  //  - Ya se ejecutó la TC-PROJ-60A
  //  - Ya se reiniciaron los contenedores de Appwrite
  //  - Appwrite está arriba de nuevo

  // 1. Login
  await loginAsAdmin(driver);

  // 2. Ir a la lista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 3. Verificar que el proyecto sigue existiendo y entrar
  const projectLink = await driver.findElement(
    By.xpath(
      `//*[@id="svelte"]/main/div/section/div[2]/div/div/ul/a[div[contains(., "${PROJECT_NAME}")]]`
    )
  );
  expect(await projectLink.isDisplayed()).toBe(true);

  try {
    await projectLink.click();
  } catch {
    await driver.executeScript('arguments[0].click();', projectLink);
  }
  await driver.sleep(1000);

  // 4. Verificar que la plataforma Web sigue registrada
  const hostnameElement = await driver.findElement(
    By.xpath(`//main//*[contains(text(), "${HOSTNAME}")]`)
  );
  expect(await hostnameElement.isDisplayed()).toBe(true);
}, 120000);
