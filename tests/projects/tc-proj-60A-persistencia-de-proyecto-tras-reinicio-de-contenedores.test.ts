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

// ⚠️ Usa nombres fijos para poder verificarlos en la 60B
const PROJECT_NAME = 'Proyecto Persistencia QA 60';
const HOSTNAME = 'persistencia60.ejemplo.com';

async function crearProyecto(name: string) {
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(800);

  const newProjectButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div[1]/button')
  );
  await newProjectButton.click();
  await driver.sleep(400);

  const nameInput = await driver.findElement(
    By.xpath(
      '//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input'
    )
  );
  await nameInput.clear();
  await nameInput.sendKeys(name);

  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  await driver.sleep(1000);
}

async function agregarPlataformaWeb(hostname: string) {
  // Mismo flujo que la TC-51
  const addWebPlatformButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div/div[2]/div[2]/div/div[2]/div[2]/div[1]/button[1]')
  );
  await addWebPlatformButton.click();
  await driver.sleep(800);

  const tipoLabel = await driver.findElement(
    By.xpath('//*[@id="svelte"]/section[2]/div/div/div[2]/main/div/form/div/fieldset[1]/div/div/div[1]/label[4]')
  );
  await tipoLabel.click();
  await driver.sleep(400);

  const hostnameInput = await driver.findElement(
    By.xpath('//*[@id="hostname"]')
  );
  await hostnameInput.clear();
  await hostnameInput.sendKeys(hostname);

  const createPlatformButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/section[2]/div/div/div[2]/main/div/form/div/div/button')
  );
  await createPlatformButton.click();

  await driver.sleep(1500);

  // Omitir y volver a la pantalla principal del proyecto
  const skipLink = await driver.findElement(
    By.xpath('//*[@id="svelte"]/section[2]/div/footer/a')
  );
  await skipLink.click();
  await driver.sleep(1000);
}

test('TC-PROJ-60A Setup de persistencia: crear proyecto y plataforma Web', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear proyecto
  await crearProyecto(PROJECT_NAME);

  // 3. Crear plataforma Web
  await agregarPlataformaWeb(HOSTNAME);

  // 4. Verificación rápida previa al reinicio
  const hostnameElement = await driver.findElement(
    By.xpath(`//main//*[contains(text(), "${HOSTNAME}")]`)
  );
  expect(await hostnameElement.isDisplayed()).toBe(true);

  // La validación de persistencia real se hará en la 60B
}, 120000);
