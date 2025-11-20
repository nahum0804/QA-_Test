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

test('TC-PROJ-42 No permite crear proyecto sin nombre (el formulario sigue abierto)', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Ir a la vista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 3. Click en el botón "Nuevo proyecto"
  const newProjectButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div[1]/button')
  );
  await newProjectButton.click();
  await driver.sleep(500);

  // 4. Localizar el input de nombre y dejarlo vacío
  const nameInput = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input')
  );
  await nameInput.clear(); // aseguramos que está vacío

  // 5. Click en "Create" / "Save" sin nombre
  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  await driver.sleep(800);

  // 6. Validar que el formulario sigue abierto (el input de nombre sigue visible)
  const stillVisible = await nameInput.isDisplayed();

  // Si el nombre fuera aceptado, lo normal sería que el diálogo se cierre
  // y este input ya no estuviera visible.
  expect(stillVisible).toBe(true);
}, 90000);
