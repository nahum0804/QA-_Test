import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

// Datos del proveedor que vamos a actualizar
const PROVIDER_NAME_INITIAL = 'Prueba1'; 
const PROVIDER_NAME_UPDATED = `Prueba1-Updated-${Date.now()}`; 

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-66 Actualizar provider existente (Cambio de Nombre)', async () => {
  
  // 1. Navegar a la consola y seleccionar el proyecto
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  const projectCard = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div/section/div[2]/div/div/ul/a[1]/div/div[1]/div[1]/h4") 
  );
  await projectCard.click();
  await driver.sleep(1000);
    
  // 2. Ir a MENSAJERÍA (Messaging)
  const messagingButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[1]/nav/div[2]/div/div/span[5]/a/span[2]") 
  );
  await messagingButton.click();
  await driver.sleep(800);
    
  // 3. Click en el botón "Providers"
  const providersLink = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[1]/div/div/div[2]/div/a[3]") 
  );
  await providersLink.click();
  await driver.sleep(3000); 

  // 4. Click sobre el provider 
  const providerNameLink = await driver.wait(
      until.elementLocated(By.xpath(`/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[1]/div/a/div[3]`)), 
      10000,
  );
  await providerNameLink.click();
  await driver.sleep(2000); 

  // 5. Localizar el campo de entrada 'Provider name'
  const detailNameInput = await driver.wait(
      until.elementLocated(By.xpath(`/html/body/div[1]/main/div[3]/section/div[2]/div/div/form[1]/div/div/div[1]/div[2]/div/ul/div/div/input`)),
      10000,
      'El panel de edición no se abrió (no se encontró el campo de nombre).'
  );
  
  // 6. Borrar el nombre existente y escribir el nuevo nombre
  await detailNameInput.clear();
  await detailNameInput.sendKeys(PROVIDER_NAME_UPDATED);
  await driver.sleep(500);

  // 7. Click en el botón 'Update'
  const updateButton = await driver.findElement(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/form[1]/div/div/div[2]/button"));
  await updateButton.click();
  
  // Esperar a que la actualización termine y la página se refresque/cierre el panel
  await driver.sleep(3000); 

  // 8. Validar que el provider actualizado (con el nuevo nombre) aparece en la lista
  const updatedProvider = await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), '${PROVIDER_NAME_UPDATED}')]`)), 
      10000,
      `El provider con el nuevo nombre '${PROVIDER_NAME_UPDATED}' no fue encontrado en la lista después de actualizarse.`
  );

  const isVisible = await updatedProvider.isDisplayed();
  expect(isVisible).toBe(true);
});