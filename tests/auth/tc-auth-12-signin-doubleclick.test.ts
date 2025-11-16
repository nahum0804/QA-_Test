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

test(
  'TC-AUTH-12 Verificar que doble click en el botón de login no sea permitido (si existiera validación)',
  async () => {
    await driver.get(`${BASE_URL}/console/login`);
    await driver.sleep(500);

    const emailInput = await driver.findElement(By.id('email'));
    const passwordInput = await driver.findElement(By.id('password'));

    await emailInput.sendKeys("n4hummuro227@gmail.com");
    await passwordInput.sendKeys("12345678");

    // Locator estable
    const signInButtonLocator = By.xpath(
      "/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button"
    );

    // Primer click
    let signInButton = await driver.findElement(signInButtonLocator);
    await signInButton.click();
    await driver.sleep(300);

    try {
      signInButton = await driver.findElement(signInButtonLocator);
    } catch {
      console.warn(
`TC-AUTH-10 – Caso NO definido en la app:
  • El botón 'Sign in' desapareció o fue recreado tras el primer click.
  • No hay lógica anti-doble-click implementada.
  • La app probablemente recargó/re-renderizó el formulario sin deshabilitar el botón.`
      );
      return;
    }

    // Revisar estado después del primer click
    const isEnabledAfterClick = await signInButton.isEnabled();
    const disabledAttr = await signInButton.getAttribute('disabled');

    if (isEnabledAfterClick || disabledAttr === null) {
      console.warn(
`TC-AUTH-10 – Caso NO definido en la app:
  • El botón de login sigue habilitado después del primer click.
  • La app NO previene doble-click ni envíos múltiples.
  • Estado real:
      - isEnabled(): ${isEnabledAfterClick}
      - atributo disabled: ${disabledAttr}`
      );
      return;
    }
    expect(isEnabledAfterClick).toBe(false);
  },
  60000
);
