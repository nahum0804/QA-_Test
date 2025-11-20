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
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input')
  );
  await nameInput.clear();
  await nameInput.sendKeys(name);

  // Botón crear
  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  // Después de crear, Appwrite deja al usuario dentro del proyecto
  await driver.sleep(1000);
}

test('TC-PROJ-51 Agregar plataforma Web con origen válido', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear un proyecto
  const projectName = 'Proyecto Plataforma Web';
  const hostnameValido = 'miapp.ejemplo.com';

  await crearProyecto(projectName);

  // 3. Click en "Añadir plataforma Web" directamente desde la vista del proyecto
  const addWebPlatformButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div/div[2]/div[2]/div/div[2]/div[2]/div[1]/button[1]')
  );
  await addWebPlatformButton.click();
  await driver.sleep(800);

  // 4. Elegir tipo (tu label[4])
  const tipoLabel = await driver.findElement(
    By.xpath('//*[@id="svelte"]/section[2]/div/div/div[2]/main/div/form/div/fieldset[1]/div/div/div[1]/label[4]')
  );
  await tipoLabel.click();
  await driver.sleep(400);

  // 5. Escribir el hostname válido
  const hostnameInput = await driver.findElement(
    By.xpath('//*[@id="hostname"]') // equivale a By.id('hostname')
  );
  await hostnameInput.clear();
  await hostnameInput.sendKeys(hostnameValido);

  // 6. Click en botón "Crear"
  const createPlatformButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/section[2]/div/div/div[2]/main/div/form/div/div/button')
  );
  await createPlatformButton.click();


}, 120000);
