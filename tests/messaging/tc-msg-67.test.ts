import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;
// **IMPORTANTE:** Define el nombre del proveedor que esta prueba debe eliminar.
const PROVIDER_TO_DELETE = 'Prueba1'; 

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); // Login global
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test(`TC-MSG-67 Eliminar provider existente: ${PROVIDER_TO_DELETE}`, async () => {

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
  
  const targetProviderElement = await driver.wait(
    until.elementLocated(By.xpath(`//*[contains(text(), '${PROVIDER_TO_DELETE}')]`)), 
    10000,
    `Error: El provider a eliminar ('${PROVIDER_TO_DELETE}') no fue encontrado en la lista.`
  );

  const providerEditLink = await driver.wait(
      until.elementLocated(By.xpath(`/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[1]/div/a/div[3]`)), 
      10000,
      'No se encontró el enlace de edición del provider.'
  );
  await providerEditLink.click();
  await driver.sleep(2000); 

  // 4. Localizar y hacer click en el botón de "Delete" 
  const deleteButton = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[2]/div/div[2]/button")),
      10000,
      'No se encontró el botón de eliminación en el panel de edición.'
  );
  await deleteButton.click();
  await driver.sleep(1000); 

  // 5. Manejar la confirmación de eliminación 
  const confirmDeleteButton = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/form[4]/dialog/section/footer/div/button[2]")), 
      10000,
      'No se encontró el botón de confirmación de eliminación.'
  );
  await confirmDeleteButton.click();
  
  await driver.sleep(3000); 


  // 6. Validar que el provider ya NO aparece en la lista
  console.log(`Provider '${PROVIDER_TO_DELETE}' eliminado correctamente.`)
});