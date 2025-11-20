import { beforeAll, afterAll, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config';
import { loginAsAdmin } from '../helpers/authHelpers';

jest.setTimeout(180000);

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
}, 180000);

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
}, 60000);

async function crearProyecto(name: string) {
  // Ir a la vista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(800);

  // Botón "Nuevo proyecto"
  const newProjectButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/div[2]/div/div/div[1]/button')
  );
  await newProjectButton.click();
  await driver.sleep(400);

  // Input nombre
  const nameInput = await driver.findElement(
    By.xpath(
      '//*[@id="svelte"]/main/div/section/form[4]/dialog/section/div/div/div/div/div/div[1]/div[1]/div/input'
    )
  );
  await nameInput.clear();
  await nameInput.sendKeys(name);

  // Botón crear
  const submitButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div/section/form[4]/dialog/section/footer/div/button')
  );
  await submitButton.click();

  // Después de crear, Appwrite deja al usuario dentro del proyecto
  await driver.sleep(1000);
}

test('TC-PROJ-56 Invitar/crear colaborador con rol Viewer (crear usuario)', async () => {
  // 1. Login
  await loginAsAdmin(driver);

  // 2. Crear proyecto
  const projectName = 'Proyecto Usuarios QA';
  await crearProyecto(projectName);

  // 3. Ir a la sección de Usuarios (sin salir del proyecto)
  const usersLink = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[1]/nav/div[2]/div/div/span[2]/a')
  );
  await usersLink.click();
  await driver.sleep(800);

  // 4. Click en "Crear usuario"
  const createUserButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/div[2]/div/div/div[2]/div/footer/button')
  );
  await createUserButton.click();
  await driver.sleep(800);

  // 5. Llenar los datos del usuario
  const userName = 'Usuario Viewer QA';
  const userEmail = 'ejemplo@gmail.com';
  const userPhone = '+888888888';
  const userPassword = 'PasswordSegura123'; // > 8 caracteres

  const nameInput = await driver.findElement(
    By.xpath('//*[@id="name"]')
  );
  await nameInput.clear();
  await nameInput.sendKeys(userName);

  const emailInput = await driver.findElement(
    By.xpath('//*[@id="email"]')
  );
  await emailInput.clear();
  await emailInput.sendKeys(userEmail);

  const phoneInput = await driver.findElement(
    By.xpath('//*[@id="phone"]')
  );
  await phoneInput.clear();
  await phoneInput.sendKeys(userPhone);

  const passwordInput = await driver.findElement(
    By.xpath('//*[@id="password"]')
  );
  await passwordInput.clear();
  await passwordInput.sendKeys(userPassword);

  // 6. Click en "Crear"
  const createButton = await driver.findElement(
    By.xpath('//*[@id="svelte"]/main/div[3]/section/form/dialog/section/footer/div/button[2]')
  );
  await createButton.click();
  await driver.sleep(1500);

  // 7. Validar que el usuario aparece en la lista (por correo o nombre)
  const userElement = await driver.findElement(
    By.xpath(`//main//*[contains(text(), "${userEmail}") or contains(text(), "${userName}")]`)
  );
  const isDisplayed = await userElement.isDisplayed();
  expect(isDisplayed).toBe(true);
}, 120000);
