import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config'; // o '../../src/conf'
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

async function crearProyectoConNombre(name: string) {
  // Ir a la vista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // Click en "Nuevo proyecto"
  const newProjectButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div[1]/button')
  );
  await newProjectButton.click();
  await driver.sleep(500);

  // Escribir el nombre del proyecto
  const nameInput = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input')
  );
  await nameInput.clear();
  await nameInput.sendKeys(name);

  // Click en "Create / Save"
  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  await driver.sleep(1000);
}

test('TC-PROJ-46 No permite crear dos proyectos con el mismo nombre', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // Nombre fijo "Proyecto" como dijiste
  const projectName = 'Proyecto';

  // 2. Crear el proyecto por primera vez
  await crearProyectoConNombre(projectName);

  // 3. Intentar crearlo otra vez con el mismo nombre (bucle de 2 ejecuciones)
  for (let i = 0; i < 1; i++) { // ya lo creamos 1 vez arriba, aquí sería la 2da
    await crearProyectoConNombre(projectName);
  }

  // 4. Ir a la lista de proyectos y contar cuántas veces aparece ese nombre
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  const matches = await driver.findElements(
    By.xpath(`//main//*[contains(text(), "${projectName}")]`)
  );

  // La regla esperada: solo debe existir 1 proyecto con ese nombre
  expect(matches.length).toBe(1);
}, 90000);
