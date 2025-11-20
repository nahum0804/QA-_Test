import { beforeEach, afterEach, test, expect, jest } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";
import { goToOrganizations } from "../helpers/navigation";

let driver: WebDriver;
jest.setTimeout(30000); // 30 segundos

beforeEach(async () => {
    driver = await createDriver();
    console.log("🚀 LOGIN INICIANDO");
    await login(driver);
    console.log("✅ LOGIN COMPLETADO");
    await goToOrganizations(driver);
    console.log("📁 NAVEGACIÓN COMPLETADA");
}, 20000);


afterEach(async () => {
    if (driver) {
        try { await driver.quit(); } catch {}
    }
}, 20000);

test("TC-ORG-21: Crear organización con nombre vacío", async () => {

    // ==== CLICK ROBUSTO EN CREATE ORGANIZATION ====

    let createBtn;

    try {
        createBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
            ),
            4000
        );
        console.log("✔ Encontrado botón <button> Create organization");
    } catch {
        console.log("⚠ <button> no encontrado, buscando <div>…");
    }

    if (!createBtn) {
        createBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//div[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
            ),
            4000
        );
        console.log("✔ Encontrado <div> Create organization");
    }

    await driver.executeScript("arguments[0].scrollIntoView(true);", createBtn);
    await driver.sleep(400);

    try {
        await createBtn.click();
        console.log("✔ Click normal OK");
    } catch {
        console.log("⚠ Click normal falló, usando JS click…");
        await driver.executeScript("arguments[0].click();", createBtn);
        console.log("✔ Click JS OK");
    }

        // === 1. ESPERAR APERTURA DEL MODAL ===
    await driver.sleep(1200); // animación

    // === 2. TOMAR EL INPUT DEL MODAL ===
    const nameInput = await driver.wait(
        until.elementLocated(By.xpath("//input[@placeholder='Enter name']")),
        8000
    );

    await driver.wait(until.elementIsVisible(nameInput), 8000);
    await driver.executeScript("arguments[0].scrollIntoView(true);", nameInput);
    await driver.sleep(300);

    try {
        await nameInput.clear();
        await nameInput.sendKeys("");
        console.log("✔ Input rellenado");
    } catch (e) {
        console.log("⚠ Input NO interactuable, usando force focus + JS...");
        await driver.executeScript("arguments[0].focus();", nameInput);
        await driver.executeScript("arguments[0].value='';", nameInput);
    }

    // === 4. CLICK EN BOTÓN CREATE ===
    const modalCreate = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div[1]/form/dialog/section/footer/div/button[2]")),
        8000
    );

    await driver.executeScript("arguments[0].scrollIntoView(true);", modalCreate);
    await driver.sleep(300);

    try {
        await modalCreate.click();
        console.log("✔ Click normal en Create");
    } catch (e) {
        console.log("⚠ Click normal falló, usando JS click…");
        await driver.executeScript("arguments[0].click();", modalCreate);
    }

    // === 5. ESPERAR MENSAJE DE ERROR 'required' ===
    const error = await driver.wait(
        until.elementLocated(
            By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'required')]")
        ),
        6000
    );

    expect((await error.getText()).toLowerCase()).toContain("required");
});





