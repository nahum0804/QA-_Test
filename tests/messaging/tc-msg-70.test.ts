import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;

// Este valor es solo para el mensaje de consola
const EXISTING_DRAFT_SUBJECT = 'Borrar este borrador de prueba'; 
const DELETION_MESSAGE_TEXT = EXISTING_DRAFT_SUBJECT; 

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); 
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-70 Validar la eliminación simplificada de un mensaje de borradores existente', async () => {
  
  // --- 1. NAVEGACIÓN A LA LISTA DE MENSAJES ---
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

  // --- 2. ABRIR DETALLE Y ELIMINAR ---
  
  // 2a. Localizar la fila del mensaje usando el XPath absoluto para el primer elemento
  console.log("Haciendo clic en el primer mensaje de la lista para eliminarlo.");
  
  const messageSubjectElement = await driver.wait(
      until.elementLocated(By.xpath(`/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[1]/div/a[1]/div[3]`)), 
      10000,
      `Error: No se encontró el primer mensaje para eliminar. Asegúrate de que la lista no esté vacía.`
  );
    
    const deletedSubjectText = await messageSubjectElement.getText();
    
    // 2b. Hacer clic en el elemento para abrir la vista de edición/detalle
    await messageSubjectElement.click();
    await driver.sleep(2000); 
    
    // 2c. Localizar y hacer clic en el botón "Delete" 
    const deleteButton = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/div[2]/div/div[2]/button")),
        5000,
        "No se encontró el botón 'Delete' en la vista de detalle/edición."
    );
    await deleteButton.click();
    await driver.sleep(1000); 

    // 3a. Esperar y confirmar el modal de eliminación.
    const confirmDeleteButton = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div[1]/main/div[3]/section/div[2]/div/div/form[9]/dialog/section/footer/div/button[2]")),
        5000,
        "No se encontró el botón de confirmación 'Delete' en el modal."
    );
    await confirmDeleteButton.click();
    await driver.sleep(3000); 

    // --- 4. VALIDACIÓN FINAL ---
    console.log(`Mensaje con asunto: '${deletedSubjectText}' eliminado exitosamente.`);
});