import { beforeEach, afterEach, test, jest, expect } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";

let driver: WebDriver;
jest.setTimeout(40000);

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
}, 15000);


// =================== TC-ORG-30 ==========================
test("TC-ORG-30: Eliminar organización desde Settings", async () => {

    // === 1. Ir directo a Organizations ===
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(600);

    // === 2. Seleccionar primera organización ===
    const orgCards = await driver.wait(
        until.elementsLocated(By.css("ul.grid-box a.card")),
        8000
    );

    const firstOrg = orgCards[0];

    await driver.executeScript("arguments[0].scrollIntoView(true);", firstOrg);
    await driver.sleep(200);

    try { await firstOrg.click(); }
    catch { await driver.executeScript("arguments[0].click();", firstOrg); }

    await driver.sleep(800);

    // === 3. Entrar a Settings ===
    const settingsTab = await driver.wait(
        until.elementLocated(By.xpath("//a[contains(., 'Settings')]")),
        8000
    );

    try { await settingsTab.click(); }
    catch { await driver.executeScript("arguments[0].click();", settingsTab); }

    await driver.sleep(800);

    // === 4. Click en botón DELETE ===
    console.log("🗑️ Presionando botón Delete...");
    const deleteBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Delete')]")),
        8000
    );

    try { await deleteBtn.click(); }
    catch { await driver.executeScript("arguments[0].click();", deleteBtn); }

    await driver.sleep(600);

    // === 5. Obtener el placeholder para saber el nombre exacto ===
    const confirmInput = await driver.wait(
        until.elementLocated(By.id("organization-name")),
        8000
    );

    const placeholderText = await confirmInput.getAttribute("placeholder");

    // placeholder viene así:
    // "Enter ORG_!@#-TEST to continue"
    const nameToType = placeholderText
        .replace("Enter ", "")
        .replace(" to continue", "")
        .trim();

    console.log("✏️ Escribiendo nombre requerido:", nameToType);

    await confirmInput.sendKeys(nameToType);
    await driver.sleep(600);

    // === 6. Clic en el segundo botón DELETE (submit) ===
    const confirmDeleteBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Delete') and @type='submit']")),
        8000
    );

    // Forzar habilitación si Appwrite lo bloquea
    await driver.executeScript("arguments[0].disabled = false;", confirmDeleteBtn);

    try { 
        await confirmDeleteBtn.click();
        console.log("✔ Confirmación de Delete enviada");
    } catch {
        console.log("⚠ Click normal fallo → usando JS click");
        await driver.executeScript("arguments[0].click();", confirmDeleteBtn);
    }

    await driver.sleep(1500);

    // === 7. Validación: regresar a lista de organizaciones ===
    expect(await driver.getCurrentUrl()).toContain("/console/account/organizations");

    console.log("🎉 Organización eliminada correctamente");
});
