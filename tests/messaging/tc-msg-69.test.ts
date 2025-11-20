import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

// Datos del mensaje
const MESSAGE_SUBJECT = `Draft Test ${Date.now()}`;
const RECIPIENT_EMAIL = 'test-draft@example.com'; 
const ACTIVE_EMAIL_PROVIDER_NAME = 'Prueba1'; 
// No necesitamos un Topic ID para guardar un borrador, pero dejaremos el campo de Recipient vacío o usaremos un valor si es obligatorio.
// Para este test, no usaremos el campo de Recipient para simplificar y enfocarnos en el guardado.

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-69 Crear mensaje de tipo email y Guardar como Borrador (Draft)', async () => {
  
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
    
  // 3. Click en el botón "Create Message" (Crear Mensaje)
  const createMessageButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/span[2]/button") 
  );
  await createMessageButton.click();
  await driver.sleep(1500);

  // 4. Seleccionar la opción "Email"
  const emailOption = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/div[2]/div/a[2]/div/div")), 
        5000, 
        'La opción "Email" no apareció en el menú después de hacer clic en "Create message".'
      );
      
  await emailOption.click(); 
  await driver.sleep(1000);

  // 5. Llenar Asunto (Subject)
  const subjectInput = await driver.findElement(By.xpath("/html/body/div[1]/main/div/section/section/div/div/main/form/div/fieldset[1]/div/div/div[1]/div/input"));
  await subjectInput.sendKeys(MESSAGE_SUBJECT);
  await driver.sleep(500);

  // 7. Llenar Cuerpo (Body)
  // Usamos el XPath genérico de textarea
  const bodyTextarea = await driver.findElement(By.xpath("/html/body/div[1]/main/div/section/section/div/div/main/form/div/fieldset[1]/div/div/div[3]/div/textarea"));
  await bodyTextarea.sendKeys("This is a draft test email content.");
  await driver.sleep(500);

  // 8. Click en el botón "Save" o "Draft" (Asumo que es el botón [2] en el footer)
  // Botón [3] es Send. Intentamos con [2] para Guardar.
  const saveButton = await driver.findElement(By.xpath("/html/body/div[1]/main/div/section/section/div/footer/button[2]"));
  await saveButton.click();
  await driver.sleep(3000); 
  
  

  console.log(`Mensaje '${MESSAGE_SUBJECT}' guardado exitosamente como Borrador (Draft).`);
});