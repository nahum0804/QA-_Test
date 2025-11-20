import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-DB-01 Crear base de datos válida', async () => {

  // 1. Login
  await loginAsAdmin(driver);

  // 2. Navegar a la consola
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 3. Seleccionar el proyecto de pruebas
  const projectCard = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div/section/div[2]/div/div/ul/a[1]/div/div[1]/div[1]/h4")
  );
  await projectCard.click();
  await driver.sleep(1000);

  // 4. Ir a DATOS → Databases
  const databasesButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[1]/nav/div[2]/div/div/span[3]/a/span[2]")
  );
  await databasesButton.click();
  await driver.sleep(800);

  // 5. Click en "Crear base de datos"
  const newDbButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/button")
  );
  await newDbButton.click();
  await driver.sleep(500);

  // 6. Escribir nombre
  const dbName = `BD-Auto-${Date.now()}`;
  const nameInput = await driver.findElement(By.xpath("/html/body/div[1]/main/div[3]/section/form/dialog/section/div/div/div[1]/div/input"));
  await nameInput.sendKeys(dbName);

  // 7. Guardar
  const createButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/form/dialog/section/footer/div/button[2]")
  );
  await createButton.click();
  await driver.sleep(1500);

  // 8. Validar que aparece en la lista
  const createdDb = await driver.findElement(
    By.xpath(`//*[contains(text(), '${dbName}')]`)
  );

  const isVisible = await createdDb.isDisplayed();
  expect(isVisible).toBe(true);
});
