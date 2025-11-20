import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
}, 120000);

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
}, 60000);

async function crearProyecto(name: string) {
  // Ir a la vista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(800);

  // Botón "Nuevo proyecto"
  const newProjectButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div[1]/button')
  );
  await newProjectButton.click();
  await driver.sleep(400);

  // Input nombre
  const nameInput = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input')
  );
  await nameInput.clear();
  await nameInput.sendKeys(name);

  // Botón crear
  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  await driver.sleep(800);
}

test('TC-PROJ-49 Actualizar el nombre de un proyecto de "Proyecto" a "Cambio"', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear proyecto con nombre "Proyecto"
  const originalName = 'Proyecto';
  const newName = 'Cambio';

  await crearProyecto(originalName);

  // 3. Volver a la lista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 4. Ingresar al proyecto "Proyecto" usando la tarjeta
  const projectLink = await driver.findElement(
    By.xpath(
      `//*[@id="svelte"]/main/div/section/div[2]/div/div/ul/a[div[contains(., "${originalName}")]]`
    )
  );

  try {
    await projectLink.click();
  } catch {
    await driver.executeScript('arguments[0].click();', projectLink);
  }

  await driver.sleep(1000);

  // 5. Ir a la sección de Settings
  const settingsLink = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[1]/nav/div[3]/div/span/a/span[2]')
  );
  await settingsLink.click();
  await driver.sleep(800);

  // 6. Editar el nombre del proyecto a "Cambio" usando JavaScript
  const nameInputSettings = await driver.findElement(
    By.xpath('//*[@id="name"]')
  );

  await driver.executeScript('arguments[0].scrollIntoView(true);', nameInputSettings);

  await driver.executeScript(
    `
    arguments[0].value = arguments[1];
    const event = new Event('input', { bubbles: true });
    arguments[0].dispatchEvent(event);
    `,
    nameInputSettings,
    newName
  );

  // 7. Click en botón "Actualizar"
  const updateButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/form[1]/div/div/div[2]/button')
  );
  await updateButton.click();

  await driver.sleep(1200);

  // 8. Volver a leer el valor del input en Settings para confirmar el cambio
  const nameInputSettingsAfter = await driver.findElement(
    By.xpath('//*[@id="name"]')
  );
  const valueAfter = await nameInputSettingsAfter.getAttribute('value');

  // 9. Verificar que el valor ahora es "Cambio"
  expect(valueAfter).toBe(newName);
}, 90000);
