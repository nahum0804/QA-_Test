import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver);
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-62 Intentar crear provider con nombre vacío y validar mensaje de error', async () => {

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
  await driver.sleep(800);

  // 4. Click en "Crear Provider" (Botón principal)
  const createProviderButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/span[2]/button") 
  );
  await createProviderButton.click();
  await driver.sleep(1000);

  // 5. Seleccionar la opción "Email" del menú desplegable
  const emailOption = await driver.wait(
    until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/div[2]/div/button[2]/div/div")), 
    5000, 
    'La opción "Email" no apareció en el menú.'
  );
  
  await emailOption.click(); 
  await driver.sleep(1000); 

  // 6. Localizar el campo de Nombre y el botón de Guardar
  const nameInput = await driver.findElement(By.xpath("/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[1]/div/div/div[1]/div/input"));
  const saveButton = await driver.findElement(By.xpath("/html/body/div[1]/section[2]/div/footer/div/button")); 
  
  // 7. Asegurarse de que el campo de nombre esté vacío
  await nameInput.clear(); 
  await driver.sleep(500);

  // 8. Intentar guardar
  await saveButton.click();
  await driver.sleep(1000); 


  const ERROR_MESSAGE_XPATH = `/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[1]/div/div/div[1]/div[2]/span[2]`; 
 
 // Usamos until.elementLocated para esperar a que el mensaje de error sea visible
  const validationMessage = await driver.wait(
      until.elementLocated(By.xpath(ERROR_MESSAGE_XPATH)), 
      3000, 
      'El mensaje de error "This field is required" no apareció.'
  );

  // 10. Validar que el mensaje es visible y contiene el texto correcto
  const text = await validationMessage.getText();
  const isDisplayed = await validationMessage.isDisplayed();

  expect(isDisplayed).toBe(true);
  expect(text).toContain("This field is required");
});