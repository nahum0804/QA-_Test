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

test('TC-PROJ-56 Eliminar un API existente', async () => {
  // ⚠️ Esta prueba asume que ya existe al menos un proyecto y al menos un API creado

  // 1. Login
  await loginAsAdmin(driver);

  // 2. Ir a la lista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 3. Entrar a un proyecto existente (tomamos el primero de la lista)
  const firstProjectLink = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/ul/a[1]')
  );
  await firstProjectLink.click();
  await driver.sleep(1000);

  // 4. Ir a la sección de APIs
  const apisTab = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div/div[2]/div[1]/div/a[2]')
  );
  await apisTab.click();
  await driver.sleep(1000);

  // 5. Entrar al primer API de la lista
  const apiLink = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div/div[2]/div[2]/div/a')
  );

  const apiName = (await apiLink.getText()).trim(); // para validar luego
  await apiLink.click();
  await driver.sleep(800);

  // 6. Click en botón "Eliminar"
  const deleteButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div[2]/div/div[2]/button')
  );
  await deleteButton.click();
  await driver.sleep(600);

  // 7. Confirmar eliminación
  const confirmDeleteButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/form/dialog/section/footer/div/button[2]')
  );
  await confirmDeleteButton.click();
  await driver.sleep(1200);

  // 8. Volver a la sección de APIs para comprobar que el API ya no está
  const apisTabAgain = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div/div[2]/div[1]/div/a[2]')
  );
  await apisTabAgain.click();
  await driver.sleep(1000);

  // 9. Verificar que el API eliminado ya no aparece por nombre
  //    (si apiName viene vacío, omitimos esta verificación de texto)
  if (apiName) {
    const matches = await driver.findElements(
      By.xpath(`//main//*[contains(text(), "${apiName}")]`)
    );
    expect(matches.length).toBe(0);
  } else {
    // Si el nombre estaba vacío por alguna razón, al menos comprobamos que no haya error al listar
    const apiListContainer = await driver.findElement(
      By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div/div[2]/div[2]')
    );
    expect(await apiListContainer.isDisplayed()).toBe(true);
  }
}, 120000);
