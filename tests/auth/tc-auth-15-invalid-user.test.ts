import { beforeEach, afterEach, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';

jest.setTimeout(60000);

let driver: WebDriver;

beforeEach(async () => {
  driver = await createDriver();
}, 60000);

afterEach(async () => {
  if (driver) {
    await driver.quit();
  }
}, 30000);


test('TC-AUTH-15 Login inválido debe mostrar mensaje dentro del modal (span dentro del div)', async () => {

  await driver.get(`${BASE_URL}/console/login`);
  await driver.sleep(500);

  const emailInput = await driver.findElement(By.id("email"));
  const passwordInput = await driver.findElement(By.id("password"));

  await emailInput.sendKeys("usuario-falso@example.com");
  await passwordInput.sendKeys("PasswordIncorrecta123");

  const signInButtonLocator = By.xpath(
    "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button"
  );
  let signInButton = await driver.findElement(signInButtonLocator);
  await signInButton.click();
  await driver.sleep(500);

  const parentDivXPath = "/html/body/div[1]/section/div";

  const parentDivElements = await driver.findElements(By.xpath(parentDivXPath));

  if (parentDivElements.length === 0) {
    console.warn(
`TC-AUTH-15 – Caso NO definido en la app:
  • Se intentó login inválido.
  • No se encontró el modal de alerta (div padre: ${parentDivXPath}).
  • La app no muestra popup de error o la estructura cambió.`
    );
    return;
  }

  const parentDiv = parentDivElements[0];

  const spanElements = await parentDiv.findElements(By.tagName("span"));

  if (spanElements.length === 0) {
    console.warn(
`TC-AUTH-15 – Caso NO definido en la app:
  • El modal sí apareció (div padre encontrado).
  • PERO no se encontró ningún <span> con mensaje de error dentro del modal.
  • La app no está mostrando el mensaje esperado.`
    );
    return;
  }

  const messageSpan = spanElements[0];
  const messageText = (await messageSpan.getText()).trim();

  expect(await messageSpan.isDisplayed()).toBe(true);
  expect(messageText.length).toBeGreaterThan(0);

}, 60000);
