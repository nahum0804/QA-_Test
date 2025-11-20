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

test('TC-PROJ-43 No permite crear proyecto con nombre demasiado largo', async () => {
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

  // 4. Nombre demasiado largo
  const nameInput = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input')
  );
  await nameInput.clear();

  // Por ejemplo, 300 caracteres
  const longName = 'Q'.repeat(300);
  await nameInput.sendKeys(longName);

  // 5. Click en "Create" / "Save"
  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  await driver.sleep(800);

  // 6. Validar que el formulario sigue abierto (no se aceptó el nombre)
  const stillVisible = await nameInput.isDisplayed();
  expect(stillVisible).toBe(true);

  // (Opcional extra) Validar que NO apareció un proyecto con ese nombre en la lista
  // Volvemos a la lista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  const matches = await driver.findElements(
    By.xpath(`//main//*[contains(text(), "${longName}")]`)
  );

  // No debería existir ningún proyecto con ese nombre larguísimo
  expect(matches.length).toBe(0);
}, 90000);
