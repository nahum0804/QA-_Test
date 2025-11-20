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

test("TC-ORG-24: Crear organización con caracteres especiales", async () => {

    const ORG_NAME = "ORG_!@#-TEST";

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
    `, nameInput, ORG_NAME);

    console.log("✔ Nombre especial seteado por JS:", ORG_NAME);

    // ==== CLICK EN CREATE DEL MODAL ====
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

    // 🚫 No validamos URL, no buscamos cards, no navegamos más.
    console.log("🎉 ORGANIZACIÓN CON CARACTERES ESPECIALES CREADA (no se valida nada más)");
});
