import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By, until } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(120000);

let driver: WebDriver;
// Usa un nombre de provider conocido. 
// Si dependes de TC-MSG-61, debes asegurarte de que TC-MSG-61 se ejecute antes o uses un setup global.
// Para esta prueba, usaremos el nombre generado en la última ejecución exitosa del TC-MSG-61 si es posible,
// o un nombre de provider que sabes que existe, por ejemplo, 'Mailgun-Auto-TEST'.
const EXISTING_PROVIDER_NAME = 'Mailgun-Auto-1763631748590'; 

beforeAll(async () => {
  driver = await createDriver();
  await loginAsAdmin(driver); // Login global
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

test('TC-MSG-64 Listar providers existentes', async () => {

  // --- 1. NAVEGACIÓN A LA LISTA DE PROVIDERS (Reutilizando XPaths) ---
  
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
  await driver.sleep(3000); // Esperar un poco más a que la lista se cargue

  // --- 2. VALIDACIÓN DE LISTADO ---

  // 4. Buscar el elemento que contiene el nombre del provider existente
    const LISTING_NAME = 'Prueba1'; // Usamos un nombre fijo
    const listedProvider = await driver.wait(
        until.elementLocated(By.xpath(`//*[contains(text(), '${LISTING_NAME}')]`)), 
        10000,
        `Error: El provider '${LISTING_NAME}' no fue encontrado en la lista.`
    );

    // 5. Validar que el elemento es visible
    const isVisible = await listedProvider.isDisplayed();
    expect(isVisible).toBe(true);

  // 6. (Opcional pero recomendado) Validar algún atributo adicional, por ejemplo, el tipo 'Email'
  // Busca el texto 'Email' en la misma fila del provider listado
  const providerRow = await listedProvider.findElement(By.xpath("./ancestor::tr")); // Subir al elemento <tr>
  const typeText = await providerRow.getText();
  expect(typeText).toContain('Email'); // Asegurar que en esa fila aparezca 'Email'
});