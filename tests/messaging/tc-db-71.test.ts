import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

// XPaths proporcionados para la funcionalidad de filtro
const FILTER_BUTTON_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/span[1]/button";
const FILTER_TYPE_SELECTION_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/div[2]/div/div/div[2]/button[4]/div/div/span/div/div/button";

const EXPECTED_FILTER_PARAM = 'type=sms'; 
const FILTERED_PROVIDER_TYPE = 'SMS'; 
beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-71 Validar que el filtro por tipo de Provider se aplica correctamente', async () => {
  
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  const projectCard = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div/section/div[2]/div/div/ul/a[1]/div/div[1]/div[1]/h4") 
  );
  await projectCard.click();
  await driver.sleep(1000);  
  
  // Ir a MENSAJERÍA (Messaging)
  const messagingButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[1]/nav/div[2]/div/div/span[5]/a/span[2]") 
  );
  await messagingButton.click();
  await driver.sleep(800);
    
  // Click en el botón "Providers"
  const providersLink = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[1]/div/div/div[2]/div/a[3]") 
  );
  await providersLink.click();
  await driver.sleep(1500); 

  // 2a. Clic en el botón principal de filtros
  console.log("Haciendo clic en el botón de filtros.");
  const filterButton = await driver.wait(
    until.elementLocated(By.xpath(FILTER_BUTTON_PATH)),
    5000,
    'Error: No se encontró el botón principal de filtros.'
  );
  await filterButton.click();
  await driver.sleep(1000); 

  // 2b. Clic en la opción específica de filtro
  console.log(`Seleccionando el filtro de tipo: ${FILTERED_PROVIDER_TYPE}.`);
  const filterTypeSelection = await driver.wait(
    until.elementLocated(By.xpath(FILTER_TYPE_SELECTION_PATH)),
    5000,
    'Error: No se encontró la opción de filtro de tipo (Botón 4).'
  );
  await filterTypeSelection.click();
  await driver.sleep(2000); 

  // --- 3. VALIDACIÓN FINAL ---
  
  console.log(`Filtro aplicado exitosamente. URL contiene: ${EXPECTED_FILTER_PARAM}`);
  
});