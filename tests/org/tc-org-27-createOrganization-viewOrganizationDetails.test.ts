import { beforeEach, afterEach, test, jest } from "@jest/globals";
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

// =================== TC-ORG-27 ==========================
test("TC-ORG-27: Navegar entre pestañas de una organización", async () => {

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

    await driver.sleep(800);

    // === 3. Click en Settings ===
    console.log("⚙️ Entrando a Settings...");
    const settingsTab = await driver.wait(
        until.elementLocated(By.xpath("//a[contains(., 'Settings')]")),
        8000
    );
    try { await settingsTab.click(); }
    catch { await driver.executeScript("arguments[0].click();", settingsTab); }
    await driver.sleep(600);

    // === 4. Click en Members ===
    console.log("👥 Entrando a Members...");
    const membersTab = await driver.wait(
        until.elementLocated(By.xpath("//a[contains(., 'Members')]")),
        8000
    );
    try { await membersTab.click(); }
    catch { await driver.executeScript("arguments[0].click();", membersTab); }
    await driver.sleep(600);

    // === 5. Click en Projects ===
    console.log("📁 Entrando a Projects...");
    const projectsTab = await driver.wait(
        until.elementLocated(By.xpath("//a[contains(., 'Projects')]")),
        8000
    );
    try { await projectsTab.click(); }
    catch { await driver.executeScript("arguments[0].click();", projectsTab); }
    await driver.sleep(600);

    console.log("🎉 Prueba 27 completada correctamente");
});
