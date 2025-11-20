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
    By.xpath(
      '//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input'
    )
  );
  await nameInput.clear();
  await nameInput.sendKeys(name);

  // Botón crear
  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  await driver.sleep(1000);
}

test('TC-PROJ-59 Cancelar la eliminación de un proyecto mantiene el proyecto', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear un proyecto y recordar el nombre
  const projectName = 'Proyecto cancelar eliminación QA';
  await crearProyecto(projectName);

  // 3. Volver a la pestaña de proyectos (lista)
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 4. Ingresar al proyecto creado
  const projectLink = await driver.findElement(
    By.xpath(
      `//*[@id="svelte"]/main/div/section/div[2]/div/div/ul/a[div[contains(., "${projectName}")]]`
    )
  );

  try {
    await projectLink.click();
  } catch {
    await driver.executeScript('arguments[0].click();', projectLink);
  }
  await driver.sleep(1000);

  // 5. Ir a Settings
  const settingsLink = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[1]/nav/div[3]/div/span/a/span[2]')
  );
  await settingsLink.click();
  await driver.sleep(800);

  // 6. Click en botón "Borrar"
  const deleteButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div[7]/div/div[2]/button')
  );
  await deleteButton.click();
  await driver.sleep(500);

  // 7. Escribir el nombre del proyecto en el campo de confirmación
  const confirmNameInput = await driver.findElement(
    By.xpath('//*[@id="project-name"]')
  );
  await confirmNameInput.clear();
  await confirmNameInput.sendKeys(projectName);

  // 8. En vez de confirmar eliminación, damos "Cancelar"
  const cancelButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/form[2]/dialog/section/footer/div/button[1]')
  );
  await cancelButton.click();
  await driver.sleep(1000);

  // 9. Volver a la lista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 10. Verificar que el proyecto TODAVÍA existe en la lista
  const remainingProjects = await driver.findElements(
    By.xpath(
      `//*[@id="svelte"]/main/div/section/div[2]/div/div/ul/a[div[contains(., "${projectName}")]]`
    )
  );

  // Esperamos que al menos 1 tarjeta con ese nombre siga existiendo
  expect(remainingProjects.length).toBeGreaterThan(0);
}, 120000);
