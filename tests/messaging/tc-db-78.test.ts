import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
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

test('TC-DB-02 Intentar crear base de datos con nombre vacío y validar mensaje de error', async () => {

  // 1. Login y navegación (igual que TC-DB-01)
  await loginAsAdmin(driver);
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  const projectCard = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div/section/div[2]/div/div/ul/a[1]/div/div[1]/div[1]/h4")
  );
  await projectCard.click();
  await driver.sleep(1000);

  const databasesButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[1]/nav/div[2]/div/div/span[3]/a/span[2]")
  );
  await databasesButton.click();
  await driver.sleep(800);

  const newDbButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/button")
  );
  await newDbButton.click();
  await driver.sleep(500);

  // 2. Localizar elementos
  const nameInput = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/form/dialog/section/div/div/div[1]/div/input")
  );
  const createButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/form/dialog/section/footer/div/button[2]")
  );

  // 3. Dejar el campo vacío y hacer clic en Crear
  await nameInput.clear(); // Asegurarse de que no haya texto
  await createButton.click();
  
  // 4. Esperar a que el mensaje de error sea visible
  // **IMPORTANTE: Debes reemplazar este XPath con el selector exacto del mensaje "This field is required"**
  const ERROR_MESSAGE_XPATH = `/html/body/div[1]/main/div[3]/section/form/dialog/section/div/div/div[1]/div[2]/span[2]`;
  
  const validationMessage = await driver.wait(
      until.elementLocated(By.xpath(ERROR_MESSAGE_XPATH)), 
      3000, 
      'El mensaje de error "This field is required" no apareció.'
  );
  
  // 5. Validar que el mensaje es visible y tiene el texto correcto
  const text = await validationMessage.getText();
  const isDisplayed = await validationMessage.isDisplayed();

  expect(isDisplayed).toBe(true);
  expect(text).toContain("This field is required");

});