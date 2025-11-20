import { WebDriver, By } from 'selenium-webdriver';
import { BASE_URL } from '../../src/config'; 

export async function loginAsAdmin(driver: WebDriver) {
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(500); // igual estilo que en tus TC-AUTH

  const emailInput = await driver.findElement(By.id('email'));
  const passwordInput = await driver.findElement(By.id('password'));

  // Usuario admin (mismo que usas en las pruebas 1–20)
  await emailInput.sendKeys('jyui2412@gmail.com');
  await passwordInput.sendKeys('12345678');

  const signInButton = await driver.findElement(
    By.xpath('/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button')
  );
  await signInButton.click();

  // Espera un poquito a que cargue la consola
  await driver.sleep(1000);
}

export async function loginAsViewer(driver: WebDriver) {
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(500);

  const emailInput = await driver.findElement(By.id('email'));
  const passwordInput = await driver.findElement(By.id('password'));

  // 🔧 AJUSTA ESTAS CREDENCIALES AL USUARIO VIEWER REAL QUE TENGAS EN APPWRITE
  await emailInput.sendKeys('n4hummuro227@gmail.com');
  await passwordInput.sendKeys('12345678');

  const signInButton = await driver.findElement(
    By.xpath('/html/body/div[1]/main/section[2]/div/div[1]/div/form/div/button')
  );
  await signInButton.click();

  await driver.sleep(1000);
}
