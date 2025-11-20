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


test("TC-ORG-35: Validar que el botón 'Cancel' cierra el modal sin crear una organización", async () => {

    console.log("➡️ Navegando a la lista de organizaciones…");
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(1200);

    // Contar organizaciones ANTES
    const orgsBefore = await driver.findElements(By.css("ul.grid-box a.card"));
    const countBefore = orgsBefore.length;
    console.log("📌 Cantidad de organizaciones antes:", countBefore);

    // ==== ABRIR MODAL CREATE ORGANIZATION ====
    let createBtn;

    try {
        createBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
            ),
            5000
        );
        console.log("✔ Botón encontrado (variant button)");
    } catch {
        createBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//div[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
            ),
            5000
        );
        console.log("✔ Botón encontrado (variant div)");
    }

    try {
        await createBtn.click();
    } catch {
        await driver.executeScript("arguments[0].click();", createBtn);
    }

    console.log("📂 Modal abierto");
    await driver.sleep(800);

    // ==== CLICK EN CANCEL ====
    const cancelBtn = await driver.wait(
        until.elementLocated(
            By.xpath("//button[contains(., 'Cancel')]")
        ),
        8000
    );

    console.log("🛑 Presionando Cancel…");

    try {
        await cancelBtn.click();
    } catch {
        await driver.executeScript("arguments[0].click();", cancelBtn);
    }

    await driver.sleep(900);

    // ==== VALIDAR QUE EL MODAL SE CERRÓ ====
    let modalClosed = false;
    try {
        await driver.wait(
            until.elementLocated(By.css(".modal")), 
            2000
        );
        modalClosed = false; // si lo encuentra, sigue abierto
    } catch {
        modalClosed = true; // si no lo encuentra → se cerró
    }

    expect(modalClosed).toBe(true);
    console.log("✔ Modal cerrado correctamente");

    // ==== VALIDAR QUE NO SE CREÓ ORGANIZACIÓN ====
    const orgsAfter = await driver.findElements(By.css("ul.grid-box a.card"));
    const countAfter = orgsAfter.length;

    console.log("📌 Cantidad después:", countAfter);

    expect(countAfter).toBe(countBefore);

    console.log("🎉 No se creó ninguna organización al presionar Cancel");
});
