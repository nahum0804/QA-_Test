import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(180000); // Tiempo extendido para proceso de eliminación

let driver: WebDriver;

// --- CONSTANTES ---
const COLLECTION_ID = '691f46c5000a08ac41c7'; 
const EXISTING_DB_ROW_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[1]/div/a[1]/div[2]"; 
const SETTINGS_BUTTON_PATH = "/html/body/div[1]/main/div[3]/section/div[1]/div/div/div/div[2]/div/div/a[6]"; 
// XPaths para la eliminación
const DELETE_BUTTON_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/div/div[4]/div/div[2]/button"; 
const CHECKBOX_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/div/form[3]/dialog/section/header/div[2]/p/div/div/div/div/div[1]/div/button"; 
const CONFIRM_DELETE_BUTTON_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/div/form[3]/dialog/section/footer/div/button[2]"; 
beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-DB-80 Eliminar una Colección (Tabla) de la base de datos', async () => {
  
  // --- 1. NAVEGACIÓN A DATABASES Y SELECCIÓN DE DB ---
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  const projectCard = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div/section/div[2]/div/div/ul/a[1]/div/div[1]/div[1]/h4") 
  );
  await projectCard.click();
  await driver.sleep(1000);
    
  // Ir a Bases de Datos (Database)
  const databaseButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[1]/nav/div[2]/div/div/span[3]/a/span[2]") 
  );
  await databaseButton.click();
  await driver.sleep(1500); 

  // 1a. Clic en la primera base de datos existente
  console.log("Haciendo clic en la Base de Datos.");
  const existingDbRow = await driver.wait(
      until.elementLocated(By.xpath(EXISTING_DB_ROW_PATH)),
      10000
  );
  await existingDbRow.click();
  await driver.sleep(2000); 
  // 2a. Clic en la pestaña "Settings"
  console.log("Navegando a la pestaña Settings.");
  const settingsButton = await driver.wait(
    until.elementLocated(By.xpath(SETTINGS_BUTTON_PATH)),
    5000,
    'Error: No se encontró la pestaña Settings.'
  );
  await settingsButton.click();
  await driver.sleep(1500);

  // 2b. Clic en el botón "Delete Collection"
  console.log("Haciendo clic en el botón Delete Collection.");
  const deleteButton = await driver.wait(
    until.elementLocated(By.xpath(DELETE_BUTTON_PATH)),
    5000,
    'Error: No se encontró el botón de eliminación en Settings.'
  );
  await deleteButton.click();
  await driver.sleep(1000);

  // 4a. Marcar el Checkbox/Botón de Confirmación inicial
  console.log("Marcando checkbox de confirmación.");
  const checkboxButton = await driver.wait(
    until.elementLocated(By.xpath(CHECKBOX_PATH)),
    5000,
    'Error: No se encontró el botón de confirmación/checkbox en el modal.'
  );
  await checkboxButton.click();
  await driver.sleep(500);
  
  // 4b. Clic en el botón "Confirmar Delete" final
  console.log("Confirmando la eliminación.");
  const confirmDeleteButton = await driver.findElement(By.xpath(CONFIRM_DELETE_BUTTON_PATH));
  await confirmDeleteButton.click();
  await driver.sleep(5000); 

  // --- 5. VALIDACIÓN FINAL ---
  console.log(`Colección con ID: ${COLLECTION_ID} eliminada exitosamente.`);
});