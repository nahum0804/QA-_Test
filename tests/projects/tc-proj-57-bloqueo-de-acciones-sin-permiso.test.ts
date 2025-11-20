import { beforeEach, afterEach, test, expect, jest } from '@jest/globals';
import { WebDriver, By } from 'selenium-webdriver';
import { createDriver } from '../../src/driverFactory';
import { BASE_URL } from '../../src/config'; // o '../../src/conf'
import { loginAsViewer } from '../helpers/authHelpers';

jest.setTimeout(60000);

let driver: WebDriver;

beforeEach(async () => {
  driver = await createDriver();
}, 60000);

afterEach(async () => {
  if (driver) {
    await driver.quit();
  }
}, 30000);

test('TC-PROJ-57 Bloqueo de acciones sin permiso para usuario con rol Viewer', async () => {
  // 1. Login como usuario Viewer
  await loginAsViewer(driver);

  // 2. Ir a la lista de proyectos
  await driver.get(`${BASE_URL}/console`);
  await driver.sleep(1000);

  // 3. Localizar el proyecto donde este usuario tiene rol Viewer
  // 🔧 IMPORTANTE: AJUSTA ESTE NOMBRE al proyecto real que ya tenga el viewer asignado.
  const projectName = 'PROYECTO_VIEWER_TEST'; 

  const projectRow = await driver.findElement(
    By.xpath(
      `//table//tr[.//text()[contains(., "${projectName}")]]` +
      ` | //a[contains(., "${projectName}")]/ancestor::tr`
    )
  );
  expect(await projectRow.isDisplayed()).toBe(true);

  // 4. Entrar al detalle del proyecto
  let projectLink;
  try {
    projectLink = await projectRow.findElement(
      By.xpath(".//a[contains(., '" + projectName + "')]")
    );
  } catch {
    projectLink = projectRow;
  }
  await projectLink.click();
  await driver.sleep(1000);

  // 5. Verificar que el usuario Viewer NO puede editar el proyecto
  //    Estrategia A: el botón "Edit/Editar" NO debería existir
  const editButtons = await driver.findElements(
    By.xpath(
      "//button[contains(., 'Edit') or contains(., 'Editar') or contains(., 'Update') or contains(., 'Actualizar')]"
    )
    // Ej.: si tu UI tiene data-testid, podrías usar By.css('[data-testid="project-edit"]')
  );

  // Si queremos ser estrictos: no debe haber botones de edición visibles
  expect(editButtons.length).toBe(0);

  // (Opcional) Estrategia B: si hay campos editables, intentar cambiar algo y esperar error
  // Descomenta y ajusta si tu UI sí muestra el formulario pero luego falla por permisos:
  /*
  if (editButtons.length > 0) {
    const firstEditButton = editButtons[0];
    await firstEditButton.click();
    await driver.sleep(500);

    const nameInput = await driver.findElement(
      By.css("input[name='name']")
    );
    const newName = projectName + ' - Intento Viewer';
    await nameInput.clear();
    await nameInput.sendKeys(newName);

    const saveButton = await driver.findElement(
      By.xpath("//button[contains(., 'Save') or contains(., 'Guardar') or contains(., 'Update')]")
    );
    await saveButton.click();
    await driver.sleep(500);

    // Buscar mensaje de error de permisos
    const permissionError = await driver.findElement(
      By.xpath(
        "//*[contains(@class,'error') or contains(@class,'toast') or contains(@class,'alert')]" +
        "[contains(., 'permission') or contains(., 'Permission') or " +
        " contains(., 'forbidden') or contains(., 'denied') or " +
        " contains(., 'permiso') or contains(., 'No autorizado')]"
      )
    );
    const errorText = await permissionError.getText();
    expect(await permissionError.isDisplayed()).toBe(true);
    expect(errorText.toLowerCase()).toMatch(/permission|forbidden|denied|permiso|autorizado/);
  }
  */
}, 60000);
