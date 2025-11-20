import { beforeEach, afterEach, test, expect, jest } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";
import { goToOrganizations } from "../helpers/navigation";

let driver: WebDriver;
jest.setTimeout(40000);

beforeEach(async () => {
    driver = await createDriver();
    console.log("🚀 LOGIN INICIANDO");
    await login(driver);
    console.log("✅ LOGIN COMPLETADO");
    await goToOrganizations(driver);
    console.log("📁 NAVEGACIÓN COMPLETADA");
}, 25000);

afterEach(async () => {
    if (driver) {
        try { await driver.quit(); } catch {}
    }
}, 20000);

test("TC-ORG-25: Crear organización con nombre demasiado largo", async () => {

    // 150 caracteres
    const LONG_NAME = "A".repeat(150);

    // ==== ABRIR CREATE ORGANIZATION ====
    let createBtn;

    try {
        createBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
            ),
            5000
        );
        console.log("✔ Botón encontrado (button)");
    } catch {
        console.log("⚠ Buscando variante <div>…");
        createBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//div[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
            ),
            5000
        );
    }

    await driver.executeScript("arguments[0].scrollIntoView(true);", createBtn);
    await driver.sleep(200);

    try {
        await createBtn.click();
        console.log("✔ Click normal OK");
    } catch {
        console.log("⚠ Usando JS click");
        await driver.executeScript("arguments[0].click();", createBtn);
    }

    await driver.sleep(800);

    // ==== INPUT ORGANIZATION NAME ====
    const nameInput = await driver.wait(
        until.elementLocated(By.id("organization-name")),
        8000
    );

    console.log("✔ Input localizado");

    await driver.executeScript("arguments[0].focus();", nameInput);
    await driver.sleep(100);

    await driver.executeScript("arguments[0].value='';", nameInput);

    await driver.executeScript(`
        arguments[0].value = arguments[1];
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
    `, nameInput, LONG_NAME);

    console.log("✔ Nombre excesivamente largo seteado por JS (150 chars)");

    // ==== CLICK CREATE ====
    const modalCreate = await driver.wait(
        until.elementLocated(
            By.xpath("//button[@type='submit' and contains(., 'Create')]")
        ),
        8000
    );

    try {
        await modalCreate.click();
        console.log("✔ Click CREATE OK");
    } catch {
        console.log("⚠ Usando JS click en CREATE");
        await driver.executeScript("arguments[0].click();", modalCreate);
    }

    // ==== ESPERAR EL ERROR ====
    console.log("⏳ Esperando mensaje de error por nombre demasiado largo…");

    const errorToast = await driver.wait(
        until.elementLocated(
            By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'too')] | \
                      //*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'long')] | \
                      //*[contains(@class, 'error')]")
        ),
        8000
    );

    const errorText = await errorToast.getText();
    console.log("❌ ERROR DETECTADO:", errorText);

    expect(errorText.toLowerCase()).toContain("long");

    console.log("🎉 PRUEBA COMPLETADA: El sistema rechazó el nombre demasiado largo");
});
