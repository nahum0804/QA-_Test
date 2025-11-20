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
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(800);

  const newProjectButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div[1]/button')
  );
  await newProjectButton.click();
  await driver.sleep(400);

  const nameInput = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input')
  );
  await nameInput.clear();
  await nameInput.sendKeys(name);

  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  await driver.sleep(800);
}

test('TC-PROJ-48 Ver detalles de un proyecto desde la lista', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear un proyecto para esta prueba
  const projectName = `Proyecto Detalles QA ${Date.now()}`;
  await crearProyecto(projectName);

  // 3. Volver a la lista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 4. Click en la tarjeta del proyecto usando tu XPath base + el texto del nombre
  const projectCard = await driver.findElement(
    By.xpath(
      `//*[@id="svelte"]/main/div/section/div[2]/div/div/ul/a/div[contains(., "${projectName}")]`
    )
  );

  await projectCard.click();
  await driver.sleep(1000);

  // 5. Validar que estamos viendo los detalles del proyecto (el nombre aparece en la vista)
  const detailHeader = await driver.findElement(
    By.xpath(`//main//*[contains(text(), "${projectName}")]`)
  );

  const isDisplayed = await detailHeader.isDisplayed();
  expect(isDisplayed).toBe(true);
}, 90000);
