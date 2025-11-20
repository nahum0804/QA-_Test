import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;
const PROVIDER_NAME = `DomainlessTest-${Date.now()}`;

// XPaths específicos de la prueba
const NAME_INPUT_PATH = "/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[1]/div/div/div[1]/div/input";
const DOMAIN_INPUT_PATH = "/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[2]/div/div/div[2]/div/input";
const SAVE_BUTTON_PATH = "/html/body/div[1]/section[2]/div/footer/div/button"; 
const DOMAIN_ERROR_MESSAGE_XPATH = `/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[2]/div/div/div[2]/div[2]/span[2]`;


beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver);
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-63 Intentar crear provider de Email sin Dominio y validar mensaje de error', async () => {

  // --- 1. NAVEGACIÓN A PROVEEDORES ---
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
  await driver.sleep(800);

  // Click en "Crear Provider" (Botón principal)
  const createProviderButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/span[2]/button") 
  );
  await createProviderButton.click();
  await driver.sleep(1000);

  // Seleccionar la opción "Email" del menú desplegable
  const emailOption = await driver.wait(
    until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/div[2]/div/button[2]/div/div")), 
    5000, 
    'La opción "Email" no apareció en el menú.'
  );
  
  await emailOption.click(); 
  await driver.sleep(1000); 

  // --- 2. LLENAR NOMBRE Y DEJAR DOMINIO VACÍO ---
  
  // 2a. Llenar el campo de Nombre (para que no falle por el nombre)
  const nameInput = await driver.findElement(By.xpath(NAME_INPUT_PATH));
  await nameInput.sendKeys(PROVIDER_NAME);
  await driver.sleep(500);

  // --- 3. INTENTAR GUARDAR Y VALIDAR ERROR ---

  // 3a. Intentar guardar
  const saveButton = await driver.findElement(By.xpath(SAVE_BUTTON_PATH)); 
  await saveButton.click();
  await driver.sleep(1000); 

  // 3b. Esperar a que el mensaje de error del dominio sea visible
  const validationMessage = await driver.wait(
      until.elementLocated(By.xpath(DOMAIN_ERROR_MESSAGE_XPATH)), 
      3000, 
      'El mensaje de error "This field is required" para el dominio no apareció.'
  );

  // 3c. Validar que el mensaje es visible y contiene el texto de campo requerido
  const text = await validationMessage.getText();
  const isDisplayed = await validationMessage.isDisplayed();

  expect(isDisplayed).toBe(true);
  expect(text.toLowerCase()).toContain("required");
 
  console.log(`Validación TC-MSG-63 exitosa. El mensaje de error: "${text}" apareció correctamente para el campo Dominio.`);
});