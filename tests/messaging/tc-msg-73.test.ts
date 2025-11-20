import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

// Datos para la prueba
const MESSAGE_SUBJECT = `Error Test ${Date.now()}`;
const ACTIVE_EMAIL_PROVIDER_NAME = 'Prueba1'; 

// XPath proporcionado para el mensaje de error del cuerpo
const BODY_ERROR_XPATH = "/html/body/div[1]/main/div/section/section/div/div/main/form/div/fieldset[1]/div/div/div[3]/div[2]/span[2]";

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-73 Validar error al intentar guardar mensaje con cuerpo vacío', async () => {
  
  // --- 1. NAVEGACIÓN Y APERTURA DE FORMULARIO ---
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
    
  // Clic en "Create Message"
  const createMessageButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/span[2]/button") 
  );
  await createMessageButton.click();
  await driver.sleep(1500);

  // Seleccionar "Email"
  const emailOption = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/div[2]/div/a[2]/div/div")), 
        5000
      );
      
  await emailOption.click(); 
  await driver.sleep(1000);

  // --- 2. LLENAR CAMPOS REQUERIDOS Y DEJAR CUERPO VACÍO ---

  // 2a. Llenar Asunto (Subject)
  await driver.findElement(By.xpath("/html/body/div[1]/main/div/section/section/div/div/main/form/div/fieldset[1]/div/div/div[1]/div/input")).sendKeys(MESSAGE_SUBJECT);
  await driver.sleep(500);


  // 2c. Dejar el Cuerpo (Body) vacío. 
  // NO hacemos clic ni enviamos nada al textarea.
  
  // --- 3. INTENTAR GUARDAR Y VALIDAR ERROR ---

  // 3a. Click en el botón "Save" o "Draft" (Asumo que es el botón [2] en el footer)
  const saveButton = await driver.findElement(By.xpath("/html/body/div[1]/main/div/section/section/div/footer/button[2]"));
  await saveButton.click();
  
  // 3b. Validar que el mensaje de error aparece en el XPath proporcionado
  const errorMessage = await driver.wait(
    until.elementLocated(By.xpath(BODY_ERROR_XPATH)),
    5000,
    'El mensaje de error de cuerpo vacío no apareció después de intentar guardar.'
  );
  
  // 3c. Validar que el texto del error es el esperado (o al menos indica que el campo es obligatorio)
  const errorText = await errorMessage.getText();
  const expectedError = errorText.toLowerCase().includes('required') || errorText.toLowerCase().includes('obligatorio') || errorText.toLowerCase().includes('cuerpo');
  
  expect(expectedError).toBe(true);
  
  console.log(`Validación TC-MSG-73 exitosa. El mensaje de error: "${errorText}" apareció correctamente.`);
});