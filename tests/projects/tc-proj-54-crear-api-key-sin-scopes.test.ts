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

  // Después de crear, Appwrite deja al usuario dentro del proyecto / quick start
  await driver.sleep(1000);
}

test('TC-PROJ-54 No permite crear API sin permisos', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear proyecto
  const projectName = 'Proyecto API sin permisos';
  const apiName = 'API Key sin permisos QA';

  await crearProyecto(projectName);

  // 3. Elegir crear API (botón dentro del quick start)
  const createApiButton = await driver.findElement(
    By.xpath(
      '//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div/div[2]/div[2]/div/div[2]/div[2]/button/div/div'
    )
  );
  await createApiButton.click();
  await driver.sleep(800);

  // 4. Agregar nombre de la API
  const nameInput = await driver.findElement(
    By.xpath('//*[@id="name"]') // id="name"
  );
  await nameInput.clear();
  await nameInput.sendKeys(apiName);

  // 5. Elegir fecha de expiración (preset) y rango, IGUAL que en la 53
  const presetDropdown = await driver.findElement(
    By.xpath('//*[@id="preset"]/div')
  );
  await presetDropdown.click();
  await driver.sleep(400);

  const rangoOption = await driver.findElement(
    By.xpath('//*[@id="cuQ16ChRRN"]')
  );
  await rangoOption.click();
  await driver.sleep(400);


  // 6. Click en "Crear" (segundo botón del footer del formulario de API)
  const createButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div/div[2]/section/div/footer/button[2]')
  );
  await createButton.click();

  await driver.sleep(1500);

  // 7. Validar que la API NO se creó (el nombre no aparece en la pantalla)
  const matches = await driver.findElements(
    By.xpath(`//main//*[contains(text(), "${apiName}")]`)
  );

  // Si el sistema se comporta bien, no debería haber ninguna API con ese nombre
  expect(matches.length).toBe(0);


}, 120000);
