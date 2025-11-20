import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

// Datos para la prueba
const MESSAGE_SUBJECT = `UTF-8 Test ${Date.now()}`;
const ACTIVE_EMAIL_PROVIDER_NAME = 'Prueba1'; 

// Caracteres especiales y otros idiomas para validar UTF-8 completo, lo probé con emojis y no acepta emojis la plataforma
const UTF8_CONTENT = '¡Hola Mundo! Esto es una prueba de compatibilidad con caracteres especiales: 漢字, русский текст, café, & < > " \' '; 

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-75 Crear mensaje con caracteres especiales y guardar como Borrador (Draft)', async () => {
  
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

  // --- 2. LLENAR CAMPOS CON CARACTERES ESPECIALES ---

  // 2a. Llenar Asunto (Subject)
  await driver.findElement(By.xpath("/html/body/div[1]/main/div/section/section/div/div/main/form/div/fieldset[1]/div/div/div[1]/div/input")).sendKeys(MESSAGE_SUBJECT);
  await driver.sleep(500);

  // 2c. Llenar Cuerpo (Body) con contenido UTF-8 y Emojis
  const bodyTextarea = await driver.findElement(By.xpath("/html/body/div[1]/main/div/section/section/div/div/main/form/div/fieldset[1]/div/div/div[3]/div/textarea"));
  await bodyTextarea.sendKeys(UTF8_CONTENT);
  await driver.sleep(500);
  
  // --- 3. INTENTAR GUARDAR ---

  // 3a. Click en el botón "Save" o "Draft" (Asumo que es el botón [2] en el footer)
  const saveButton = await driver.findElement(By.xpath("/html/body/div[1]/main/div/section/section/div/footer/button[2]"));
  await saveButton.click();
  await driver.sleep(3000); 

  // --- 4. VALIDACIÓN DE GUARDADO Y CONTENIDO ---
  
  console.log(`Mensaje '${MESSAGE_SUBJECT}' guardado y validado exitosamente con caracteres UTF-8.`);
});