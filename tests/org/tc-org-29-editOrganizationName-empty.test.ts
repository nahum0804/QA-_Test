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


// =================== TC-ORG-29 ==========================
test("TC-ORG-29: No permitir editar nombre vacío en Settings", async () => {

    // === 1. Ir a Organizations ===
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(600);

    // === 2. Seleccionar primera organización ===
    const orgs = await driver.wait(
        until.elementsLocated(By.css("ul.grid-box a.card")),
        8000
    );
    const firstOrg = orgs[0];

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

    await driver.sleep(700);

    // === 4. Limpiar nombre para dejarlo vacío ===
    const nameInput = await driver.wait(
        until.elementLocated(By.id("name")),
        8000
    );

    await nameInput.clear();
    await driver.sleep(300);

    // === 5. Intentar hacer click en Update ===
    const updateBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Update')]")),
        8000
    );

    // Primero verificamos si el botón está deshabilitado
    let disabledAttr = await updateBtn.getAttribute("disabled");

    if (disabledAttr !== null) {
        console.log("✔ Botón Update está deshabilitado — validación correcta.");
        expect(disabledAttr).not.toBeNull();
        return;
    }

    // Si no está deshabilitado, intentar click y esperar error
    try { 
        await updateBtn.click();
        console.log("⚠ Update se intentó presionar — verificando error en UI…");
    } catch {
        await driver.executeScript("arguments[0].click();", updateBtn);
    }

    await driver.sleep(1000);

    // === 6. Validar mensaje de error o borde rojo ===
    let errorDisplayed = false;

    try {
        // errores típicos de Appwrite/UI
        const error = await driver.findElement(
            By.xpath("//*[contains(text(),'required') or contains(text(),'empty') or contains(text(),'Name')]")
        );
        if (await error.isDisplayed()) errorDisplayed = true;
    } catch {}

    // Otra forma: el input se marca como inválido
    const invalid = await nameInput.getAttribute("aria-invalid");

    if (invalid === "true") errorDisplayed = true;

    expect(errorDisplayed).toBe(true);
    console.log("✔ Error mostrado — nombre vacío NO permitido");

});
