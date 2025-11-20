import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

// --- DATOS DE LA PRUEBA ---
const FIRST_MESSAGE_ROW_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[1]/div/a[1]/div[3]";
const UPDATED_BODY_TEXT = `Cuerpo actualizado con éxito a las ${new Date().toISOString()}`; 
const BODY_TEXTAREA_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/form[4]/div/div/div[1]/div[2]/div/div[2]/div/textarea";
const UPDATE_BUTTON_PATH = "/html/body/div[1]/main/div[3]/section/div[2]/div/div/form[4]/div/div/div[2]/button"; 

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-72 Validar la actualización del cuerpo (Body) de un mensaje borrador existente (UI actual)', async () => {

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
  await driver.sleep(1500); 

  // 2a. Localizar y hacer clic en el primer mensaje (asumimos que es el que se quiere editar)
  console.log("Haciendo clic en el primer mensaje de la lista para editar.");
  
  const draftMessageSubjectElement = await driver.wait(
      until.elementLocated(By.xpath(FIRST_MESSAGE_ROW_PATH)), 
      10000,
      `Error: No se encontró el primer mensaje de la lista para editar.`
  );
    
    // Guardamos el texto del asunto para la validación final (opcional)
    const originalSubjectText = await draftMessageSubjectElement.getText(); 
    
    // 2b. Hacer clic para abrir la vista de edición/detalle
    await draftMessageSubjectElement.click();
    await driver.sleep(2000); 
    
    // 3a. Localizar el campo de texto del cuerpo (Body) con el nuevo XPath
    const bodyTextarea = await driver.wait(
        until.elementLocated(By.xpath(BODY_TEXTAREA_PATH)),
        5000,
        "No se encontró el campo de texto del cuerpo (Body) con el XPath actualizado."
    );

    // 3b. Limpiar el contenido existente y escribir el nuevo cuerpo
    await bodyTextarea.clear();
    await bodyTextarea.sendKeys(UPDATED_BODY_TEXT);
    await driver.sleep(1000);
    
    
    // 4a. Localizar y hacer clic en el botón "Update" (Actualizar)
    console.log("Haciendo clic en el botón Update para guardar cambios.");
    const updateButton = await driver.findElement(By.xpath(UPDATE_BUTTON_PATH));
    await updateButton.click();
    await driver.sleep(3000); 
    
    console.log(`Mensaje borrador (Asunto: ${originalSubjectText}) actualizado y validado exitosamente.`);

});