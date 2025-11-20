import { beforeEach, afterEach, test, jest } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";

let driver: WebDriver;
jest.setTimeout(40000);

// ================= BEFORE EACH ======================
beforeEach(async () => {
    driver = await createDriver();

    console.log("🚀 LOGIN INICIANDO");
    await login(driver);
    console.log("✅ LOGIN COMPLETADO");
}, 25000);

// ================= AFTER EACH =======================
afterEach(async () => {
    if (driver) {
        try { await driver.quit(); } catch {}
    }
}, 15000);


// ================== TC-ORG-26 ========================
test("TC-ORG-26: Navegación hasta Organizations", async () => {

    console.log("👉 Estamos dentro de la primera organización por defecto.");

    // === 1. ABRIR MENÚ DEL AVATAR ===
    const avatarMenuButton = await driver.wait(
        until.elementLocated(By.xpath("//button[.//img[@data-avatar]]")),
        8000
    );

    await driver.executeScript("arguments[0].scrollIntoView(true);", avatarMenuButton);
    await driver.sleep(200);

    try {
        await avatarMenuButton.click();
        console.log("✔ Menú del avatar abierto");
    } catch {
        console.log("⚠ Click normal falló, usando JS click");
        await driver.executeScript("arguments[0].click();", avatarMenuButton);
    }

    await driver.sleep(300);

    // === 2. CLICK EN “Account” ===
    const accountBtn = await driver.wait(
        until.elementLocated(By.css("a[href='/console/account']")),
        8000
    );

    try {
        await accountBtn.click();
        console.log("✔ Click en Account");
    } catch {
        console.log("⚠ Click normal falló, usando JS click");
        await driver.executeScript("arguments[0].click();", accountBtn);
    }

    await driver.sleep(600);

    // === 3. CLICK EN “Organizations” ===
    const organizationsTab = await driver.wait(
        until.elementLocated(By.css("a[href='/console/account/organizations']")),
        8000
    );

    try {
        await organizationsTab.click();
        console.log("✔ Click en Organizations");
    } catch {
        console.log("⚠ Click normal falló, usando JS click");
        await driver.executeScript("arguments[0].click();", organizationsTab);
    }

    await driver.sleep(800);

    console.log("📌 Ya estamos en Account → Organizations. ¿Qué sigue?");
});
