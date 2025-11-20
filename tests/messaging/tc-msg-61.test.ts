import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;
let providerName: string; 

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-61 Crear provider con datos válidos (Mailgun)', async () => {

  // Generar nombre único para el provider
  providerName = `Mailgun-Auto-${Date.now()}`;
  
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

  // 4. Click en "Crear Provider"
  const createProviderButton = await driver.findElement(
    By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/span[2]/button") 
  );
  await createProviderButton.click();
  await driver.sleep(1000);

  // --- LLENAR FORMULARIO Y GUARDAR ---

  // 5. Seleccionar el Tipo: "Email" 
  const emailOption = await driver.wait(
    until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/header/div/div/div[2]/div[2]/div/button[2]/div/div")), 
    5000, 
    'La opción "Email" no apareció en el menú después de hacer clic en "Create message".'
  );
  
  await emailOption.click(); 
  await driver.sleep(1000);

  // 6. Escribir datos
  const nameInput = await driver.findElement(By.xpath("/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[1]/div/div/div[1]/div/input")); 
  const apiKeyInput = await driver.findElement(By.xpath("/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[2]/div/div/div[1]/div/input")); 
  const domainInput = await driver.findElement(By.xpath("/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[2]/div/div/div[2]/div/input")); 
  const senderEmailInput = await driver.findElement(By.xpath("/html/body/div[1]/section[2]/div/div/div[2]/main/form/div/fieldset[2]/div/div/div[4]/div/div/input"));

  await nameInput.sendKeys(providerName);
  await apiKeyInput.sendKeys("super-secret-api-key-1234567890"); 
  await domainInput.sendKeys("your-test-domain.com"); 
  await senderEmailInput.sendKeys("test@your-test-domain.com"); 

  await driver.sleep(1000);

  // 7. Guardar
  const saveButton = await driver.findElement(
    By.xpath("/html/body/div[1]/section[2]/div/footer/div/button") 
  );
  await saveButton.click();
  await driver.sleep(3000); 


  // 8. Validar que el provider fue creado y aparece en la lista

  const createdProvider = await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), '${providerName}')]`)), 
      10000,
      `El provider con el nombre ${providerName} no fue encontrado en la lista después de crearse.`
  );

  const isVisible = await createdProvider.isDisplayed();
  expect(isVisible).toBe(true);
});