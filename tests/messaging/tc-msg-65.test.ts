import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

const PROVIDER_ID_TO_FIND = '691ee646001779bdbf26'; 
const PROVIDER_NAME_TO_FIND = 'Prueba1'; 

const COPY_SUCCESS_MESSAGE_XPATH = `//*[contains(text(), 'Copied') or contains(text(), 'Copiado')]`; 

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-65 Copiar Provider ID al portapapeles', async () => { // Renombramos la prueba

  
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);
  const projectCard = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div/section/div[2]/div/div/ul/a[1]/div/div[1]/div[1]/h4") 
  );
  await projectCard.click();
  await driver.sleep(1000);
  const messagingButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[1]/nav/div[2]/div/div/span[5]/a/span[2]") 
  );
  await messagingButton.click();
  await driver.sleep(800);
  const providersLink = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[1]/div/div/div[2]/div/a[3]") 
  );
  await providersLink.click();
  await driver.sleep(3000); 

  // Buscar el elemento que contiene el ID específico
  const providerIdElement = await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), '${PROVIDER_ID_TO_FIND}')]`)), 
      15000, 
      `Error: El proveedor con ID '${PROVIDER_ID_TO_FIND}' no existe o no se encontró en la lista después de 15s.`
  );

  // Hacer clic en el ID para copiarlo
  await providerIdElement.click();
  // No necesitamos un sleep largo aquí, la notificación es rápida


  // Validar que la notificación de éxito de copia aparece y es visible.
  const copySuccessNotification = await driver.wait(
      until.elementLocated(By.xpath(COPY_SUCCESS_MESSAGE_XPATH)),
      5000, 
      'La notificación de "Copiado" o "Copied" no apareció después de hacer clic en el ID.'
  );
  
  const isVisible = await copySuccessNotification.isDisplayed();
  expect(isVisible).toBe(true);

});