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

test('TC-PROJ-52 Intentar agregar plataforma móvil sin package (debería permitir crear)', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear un proyecto
  const projectName = 'Proyecto Plataforma Móvil';
  const mobileAppName = 'App Móvil QA';

  await crearProyecto(projectName);

  // 3. Click en botón para añadir plataforma móvil
  const addMobilePlatformButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div/div[2]/div[2]/div/div[2]/div[2]/div[2]/button[2]')
  );
  await addMobilePlatformButton.click();
  await driver.sleep(800);

  // 4. Escribir el nombre de la app móvil (campo name)
  const nameInput = await driver.findElement(
    By.xpath('//*[@id="name"]') // id="name"
  );
  await nameInput.clear();
  await nameInput.sendKeys(mobileAppName);

  // 5. Buscar el botón "Crear" de la plataforma
  //    Nota: usaremos un xpath genérico al botón del form de esta pantalla
  const createButton = await driver.findElement(
    By.xpath('//form/fieldset/div/div/button')
  );

  // 6. Verificar que el botón esté habilitado (si NO está habilitado, la prueba falla)
  const isEnabled = await createButton.isEnabled();
  expect(isEnabled).toBe(true);

  // 7. Intentar crear la plataforma
  await createButton.click();
  await driver.sleep(1500);

  // (Opcional) Podrías validar que aparece algo relacionado a esa app,
  // pero el objetivo principal de esta TC es que SÍ deje intentar crear.
}, 120000);
