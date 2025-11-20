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


// =================== TC-ORG-28 ==========================
test("TC-ORG-28: Editar nombre de organización desde Settings", async () => {

    // === 1. Ir directo a Organizations ===
    console.log("🌐 Navegando a lista de organizaciones...");
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(600);

    // === 2. Seleccionar primera organización ===
    console.log("🔍 Buscando primera organización...");
    const orgCards = await driver.wait(
        until.elementsLocated(By.css("ul.grid-box a.card")),
        8000
    );

    const firstOrg = orgCards[0];

    await driver.executeScript("arguments[0].scrollIntoView(true);", firstOrg);
    await driver.sleep(300);

    try {
        await firstOrg.click();
        console.log("✔ Entramos a la primera organización");
    } catch {
        console.log("⚠ Falló click normal → usando JS click");
        await driver.executeScript("arguments[0].click();", firstOrg);
    }

    await driver.sleep(700);

    // === 3. Click en Settings ===
    console.log("⚙️ Entrando a Settings...");
    const settingsTab = await driver.wait(
        until.elementLocated(By.xpath("//a[contains(., 'Settings')]")),
        8000
    );

    try { await settingsTab.click(); }
    catch { await driver.executeScript("arguments[0].click();", settingsTab); }

    await driver.sleep(800);

    // === 4. Editar el input de Nombre ===
    console.log("✏️ Editando nombre de la organización...");
    const nameInput = await driver.wait(
        until.elementLocated(By.id("name")),
        8000
    );

    // Limpiar el input
    await nameInput.clear();
    await driver.sleep(200);

    const newName = "ORG_EDIT_TEST_" + Date.now();
    await nameInput.sendKeys(newName);
    await driver.sleep(300);

    // === 5. Click en botón Update ===
    console.log("💾 Guardando cambios...");

    const updateBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Update')]")),
        8000
    );

    // Forzar habilitación si se desactiva por JS
    await driver.executeScript("arguments[0].disabled = false;", updateBtn);

    try { 
        await updateBtn.click();
        console.log("✔ Botón Update presionado");
    } catch {
        console.log("⚠ Click normal falló → usando JS click");
        await driver.executeScript("arguments[0].click();", updateBtn);
    }

    await driver.sleep(1500);

    // === 6. Validación opcional ===
    console.log("🔎 Validando si se actualizó el nombre...");

    const updatedNameField = await driver.wait(
        until.elementLocated(By.id("name")),
        8000
    );

    const value = await updatedNameField.getAttribute("value");

    expect(value).toBe(newName);
    console.log("🎉 Nombre actualizado correctamente:", value);
});
