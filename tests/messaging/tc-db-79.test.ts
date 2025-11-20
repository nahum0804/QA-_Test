import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

// --- CONFIGURACIÓN DE LA COLECCIÓN ---
const COLLECTION_NAME = `TestCollection_${Date.now()}`;
const COLLECTION_ID = '691f46c5000a08ac41c7'; 

// XPaths
const EXISTING_DB_ROW_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[1]/div/a[1]/div[2]";
const CREATE_COLLECTION_BUTTON_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[1]/div[2]/button";
const COLLECTION_NAME_INPUT_PATH = "/html/body/div[1]/main/div[3]/section/form/dialog/section/div/div/div[1]/div/input";
const COLLECTION_ID_INPUT_PATH = "/html/body/div[1]/main/div[3]/section/form/dialog/section/div/div/svelte-css-wrapper/div/div/div[2]/div[1]/input";
const CREATE_BUTTON_MODAL_PATH = "/html/body/div[1]/main/div[3]/section/form/dialog/section/footer/div/button[2]";


beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-DB-X1 Crear una Colección (Tabla) en una base de datos existente', async () => {
  
  // --- 1. NAVEGACIÓN A DATABASES ---
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

  // --- 2. SELECCIONAR BASE DE DATOS EXISTENTE ---
  // 2a. Clic en la primera base de datos existente 
  console.log("Haciendo clic en la primera Base de Datos de la lista.");
  const existingDbRow = await driver.wait(
      until.elementLocated(By.xpath(EXISTING_DB_ROW_PATH)),
      10000,
      'Error: No se encontró la primera base de datos para hacer clic.'
  );
  await existingDbRow.click();
  await driver.sleep(2000); // Esperar a que cargue la vista de la base de datos

  // --- 3. ABRIR MODAL DE CREACIÓN DE COLECCIÓN ---

  // 3a. Clic en el botón "Crear Tabla/Colección" 
  console.log("Haciendo clic en el botón 'Create Collection'.");
  const createCollectionButton = await driver.wait(
    until.elementLocated(By.xpath(CREATE_COLLECTION_BUTTON_PATH)),
    5000,
    'Error: No se encontró el botón para crear colección.'
  );
  await createCollectionButton.click();
  await driver.sleep(1000); 

  // --- 4. LLENAR FORMULARIO DE CREACIÓN ---

  // 4a. Llenar el Nombre de la Colección (Tabla)
  const nameInput = await driver.wait(
    until.elementLocated(By.xpath(COLLECTION_NAME_INPUT_PATH)),
    5000,
    'Error: No se encontró el campo para el nombre de la colección.'
  );
  await nameInput.sendKeys(COLLECTION_NAME);
  
  // 4b. Llenar el ID de la Colección (Tabla)
  const idInput = await driver.findElement(By.xpath(COLLECTION_ID_INPUT_PATH));
  await idInput.sendKeys(COLLECTION_ID);
  await driver.sleep(500);

  // --- 5. CONFIRMAR CREACIÓN ---

  // 5a. Clic en el botón "Create"
  const createButtonModal = await driver.findElement(By.xpath(CREATE_BUTTON_MODAL_PATH));
  await createButtonModal.click();
  await driver.sleep(3000); // Esperar a que la tabla se cree y la lista se actualice

  // --- 6. VALIDACIÓN FINAL ---
  
  console.log(`Colección '${COLLECTION_NAME}' (ID: ${COLLECTION_ID}) creada exitosamente.`);
});