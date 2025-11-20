import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config'; // o '../../src/conf'
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

async function crearProyectoSimple(name: string) {
  // Ir a la vista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(800);

  // Click en "Nuevo proyecto"
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

test('TC-PROJ-47 Listar proyectos con paginación (se muestra botón de siguiente página)', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear varios proyectos para forzar más de una página
  const baseName = `Proyecto Paginacion QA ${Date.now()}`;
  const cantidadAcrear = 12; // asumiendo que la primera página muestra menos (ej. 10)

  for (let i = 0; i < cantidadAcrear; i++) {
    const name = `${baseName} - ${i}`;
    await crearProyectoSimple(name);
  }

  // 3. Volver a la vista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 4. Verificar que existe el botón de siguiente página
  const nextPageButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div[3]/nav/a[2]')
  );

  const isDisplayed = await nextPageButton.isDisplayed();
  expect(isDisplayed).toBe(true);

  // (Opcional) Probar hacer clic en siguiente página
  await nextPageButton.click();
  await driver.sleep(800);

  // Solo comprobamos que seguimos en la vista de proyectos (no truena)
  const prevPageButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div[3]/nav/a[1]')
  );
  expect(await prevPageButton.isDisplayed()).toBe(true);
}, 120000);
