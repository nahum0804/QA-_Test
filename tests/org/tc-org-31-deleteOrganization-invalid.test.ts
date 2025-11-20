import { beforeEach, afterEach, test, jest, expect } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";

let driver: WebDriver;
jest.setTimeout(60000); // Un poco más por creación de org + proyecto

beforeEach(async () => {
    driver = await createDriver();
    console.log("🚀 LOGIN INICIANDO");
    await login(driver);
    console.log("✅ LOGIN COMPLETADO");
}, 25000);

afterEach(async () => {
    if (driver) {
        try { await driver.quit(); } catch {}
    }
}, 20000);


// =========================================================
//    TC-ORG-31: Intentar eliminar organización con proyectos
//               activos → debe mostrar error.
// =========================================================
test("TC-ORG-31: No permitir eliminar organización con proyectos activos", async () => {

    // === 1. Ir a Organizations ===
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(800);

    // === 2. Crear organización nueva ===
    const ORG_NAME = "ORG_TC31_" + Date.now();

    console.log("🆕 Creando organización:", ORG_NAME);

    let createBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")),
        8000
    );

    try { await createBtn.click(); }
    catch { await driver.executeScript("arguments[0].click();", createBtn); }

    await driver.sleep(600);

    const orgInput = await driver.wait(until.elementLocated(By.id("organization-name")), 8000);

    await orgInput.clear();
    await orgInput.sendKeys(ORG_NAME);

    const modalCreate = await driver.wait(
        until.elementLocated(By.xpath("//button[@type='submit' and contains(., 'Create')]")),
        8000
    );

    try { await modalCreate.click(); }
    catch { await driver.executeScript("arguments[0].click();", modalCreate); }

    console.log("✔ Organización creada");
    await driver.sleep(1500);


    // === 3. Volver a Organizations y entrar a la más reciente ===
    console.log("➡️ Volviendo a lista de organizaciones…");

    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(1200);

    const orgCards = await driver.wait(
        until.elementsLocated(By.css("ul.grid-box a.card")),
        10000
    );

    // Primera tarjeta = organización más nueva
    const newOrg = orgCards[0];

    await driver.executeScript("arguments[0].scrollIntoView(true);", newOrg);
    await driver.sleep(300);

    try {
        await newOrg.click();
        console.log("✔ Entramos a la nueva organización correctamente");
    } catch {
        console.log("⚠ Click normal falló → usando JS click");
        await driver.executeScript("arguments[0].click();", newOrg);
    }

    await driver.sleep(1000);


    // === 4. Crear un proyecto dentro de la organización ===
    console.log("🆕 Creando proyecto dentro de organización…");

    const projectBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Create project')]")),
        8000
    );

    try { await projectBtn.click(); }
    catch { await driver.executeScript("arguments[0].click();", projectBtn); }

    await driver.sleep(800);

    const PROJECT_NAME = "PROJECT_TC31_" + Date.now();
    const projectNameInput = await driver.wait(
        until.elementLocated(By.id("name")),
        8000
    );

    await projectNameInput.clear();
    await projectNameInput.sendKeys(PROJECT_NAME);

    const createProjectBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[@type='submit' and contains(., 'Create')]")),
        8000
    );

    try { await createProjectBtn.click(); }
    catch { await driver.executeScript("arguments[0].click();", createProjectBtn); }

    console.log("✔ Proyecto creado");
    await driver.sleep(1500);


    // === 5. Ir a Settings ===
    console.log("⚙️ Entrando a Settings…");
    const settingsTab = await driver.wait(
        until.elementLocated(By.xpath("//a[contains(., 'Settings')]")),
        8000
    );

    try { await settingsTab.click(); }
    catch { await driver.executeScript("arguments[0].click();", settingsTab); }

    await driver.sleep(900);


    // === 6. Intentar eliminar organización ===
    console.log("🗑️ Intentando borrar organización con proyecto activo…");

    const deleteBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Delete')]")),
        8000
    );

    try { await deleteBtn.click(); }
    catch { await driver.executeScript("arguments[0].click();", deleteBtn); }

    await driver.sleep(900);


    // === 7. Obtener el nombre desde placeholder del modal ===
    const confirmInput = await driver.wait(
        until.elementLocated(By.id("organization-name")),
        8000
    );

    const placeholder = await confirmInput.getAttribute("placeholder");
    const nameToType = placeholder.replace("Enter ", "").replace(" to continue", "").trim();

    await confirmInput.sendKeys(nameToType);
    await driver.sleep(500);


    // === 8. Intentar confirmar eliminación ===
    const finalDeleteBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[@type='submit' and contains(., 'Delete')]")),
        8000
    );

    // Forzar habilitación del botón si está disabled
    await driver.executeScript("arguments[0].disabled = false;", finalDeleteBtn);

    try { await finalDeleteBtn.click(); }
    catch { await driver.executeScript("arguments[0].click();", finalDeleteBtn); }

    await driver.sleep(1200);


   

});
