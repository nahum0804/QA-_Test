import { beforeEach, afterEach, test, expect, jest } from "@jest/globals";
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
}, 20000);

afterEach(async () => {
    if (driver) {
        try { await driver.quit(); } catch {}
    }
}, 15000);

test("TC-ORG-40: Validar que cerrar sesión dentro de una organización redirige a login", async () => {

    console.log("➡️ Navegando a /console/account/organizations…");
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(1200);

    // === Seleccionar primera organización ===
    const firstOrg = await driver.wait(
        until.elementLocated(By.css("ul.grid-box a.card")),
        8000
    );

    console.log("📁 Entrando a la organización…");
    try {
        await firstOrg.click();
    } catch {
        await driver.executeScript("arguments[0].click();", firstOrg);
    }

    await driver.sleep(1200);

    // === ABRIR MENÚ DE USUARIO ===
    console.log("👤 Abriendo menú de usuario…");

    const userMenuBtn = await driver.wait(
        until.elementLocated(
            By.xpath("//button[.//img[@data-avatar]]")
        ),
        8000
    );

    try {
        await userMenuBtn.click();
    } catch {
        await driver.executeScript("arguments[0].click();", userMenuBtn);
    }

    await driver.sleep(500);

    // === CLICK EN SIGN OUT (botón exacto que enviaste) ===
    console.log("🔚 Haciendo click en Sign out…");

    const logoutBtn = await driver.wait(
        until.elementLocated(
            By.xpath("//button[.//span[text()='Sign out']]")
        ),
        8000
    );

    try {
        await logoutBtn.click();
    } catch {
        await driver.executeScript("arguments[0].click();", logoutBtn);
    }

    console.log("🔄 Esperando redirección…");
    await driver.sleep(1200);

    // === VALIDAR QUE REDIRIJA A LOGIN ===
    await driver.wait(
        until.elementLocated(
            By.xpath("//*[contains(text(), 'Login') or contains(text(), 'Sign in')]")
        ),
        8000
    );

    const url = await driver.getCurrentUrl();
    const redirected = url.includes("/login") || url.includes("/signin");

    expect(redirected).toBe(true);

    console.log("🎉 Logout correcto → Redirigido a pantalla de login");
});
