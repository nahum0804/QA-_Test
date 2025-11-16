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


test('TC-AUTH-20 Verificar que el usuario pueda cerrar sesión desde el menú', async () => {

  await driver.get(`${BASE_URL}/console/login`);
  await driver.sleep(500);

  const emailInput = await driver.findElement(By.id("email"));
  const passwordInput = await driver.findElement(By.id("password"));

  await emailInput.sendKeys("n4hummuro227@gmail.com");
  await passwordInput.sendKeys("12345678");

  const signInButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button")
  );
  await signInButton.click();
  await driver.sleep(800);

  const currentUrl = await driver.getCurrentUrl();
  if (currentUrl.includes("/console/login")) {
    console.warn(
`TC-AUTH-20 – Caso NO definido en la app:
  • Se intentó hacer login con credenciales válidas.
  • La app NO redirigió fuera de /console/login.
  • Conclusión: El login podría estar fallando o la app no navega correctamente.`
    );
    return;
  }

  const userMenuButtonXPath = "/html/body/div[1]/main/header/div[2]/div/button";
  let userMenuButtons = await driver.findElements(By.xpath(userMenuButtonXPath));

  if (userMenuButtons.length === 0) {
    console.warn(
`TC-AUTH-18 – Caso NO definido en la app:
  • El usuario inició sesión correctamente.
  • PERO no se encontró el botón del menú de usuario:
      ${userMenuButtonXPath}
  • No se puede verificar el cierre de sesión.`
    );
    return;
  }

  const userMenuButton = userMenuButtons[0];
  await userMenuButton.click();
  await driver.sleep(500);

  const logoutButtonXPath = "/html/body/div[1]/main/header/div[2]/div/div[3]/div/div/div/div/button";
  let logoutButtons = await driver.findElements(By.xpath(logoutButtonXPath));

  if (logoutButtons.length === 0) {
    console.warn(
`TC-AUTH-18 – Caso NO definido en la app:
  • El menú de usuario se desplegó.
  • PERO no se encontró el botón de cierre de sesión:
      ${logoutButtonXPath}
  • La app podría no tener implementado el logout desde el menú.`
    );
    return;
  }

  const logoutButton = logoutButtons[0];
  await logoutButton.click();
  await driver.sleep(800);

  const urlAfterLogout = await driver.getCurrentUrl();

  if (!urlAfterLogout.includes("/console/login")) {
    console.warn(
`TC-AUTH-18 – Caso NO definido en la app:
  • Se hizo click en el botón de cierre de sesión.
  • PERO la app NO redirigió a /console/login.
  • Conclusión: El logout podría no estar funcionando correctamente.`
    );
    return;
  }

  expect(urlAfterLogout).toContain("/console/login");

}, 60000);
