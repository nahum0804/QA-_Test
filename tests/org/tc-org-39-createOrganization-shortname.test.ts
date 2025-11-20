import { beforeEach, afterEach, test, expect, jest } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";
import { goToOrganizations } from "../helpers/navigation";

let driver: WebDriver;
jest.setTimeout(40000);

beforeEach(async () => {
    driver = await createDriver();
    console.log("🚀 LOGIN");
    await login(driver);

    await goToOrganizations(driver);
    console.log("📁 EN ORGANIZACIONES");
}, 25000);

afterEach(async () => {
    if (driver) {
        try { await driver.quit(); } catch {}
    }
}, 15000);

test("TC-ORG-39: Crear organización con nombre corto (<3 caracteres)", async () => {

    const ORG_NAME = "AB"; // Nombre corto válido

    console.log("➡️ Abriendo modal Create Organization…");

    // ======= CLICK EN CREATE ORGANIZATION =======
    let createBtn;

    try {
        createBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
            ),
            5000
        );
    } catch {
        createBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//div[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
            ),
            5000
        );
    }

    await driver.executeScript("arguments[0].scrollIntoView(true);", createBtn);
    await driver.sleep(300);

    try {
        await createBtn.click();
    } catch {
        await driver.executeScript("arguments[0].click();", createBtn);
    }

    console.log("✔ Modal abierto");

    // ======= INPUT DEL NOMBRE =======
    const nameInput = await driver.wait(
        until.elementLocated(By.id("organization-name")),
        8000
    );

    await driver.executeScript("arguments[0].focus();", nameInput);
    await driver.sleep(100);

    await driver.executeScript(`
        arguments[0].value = arguments[1];
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
    `, nameInput, ORG_NAME);

    console.log("✔ Nombre ingresado:", ORG_NAME);

    // ======= CLICK EN CREATE =======
    const modalCreate = await driver.wait(
        until.elementLocated(
            By.xpath("//button[@type='submit' and contains(., 'Create')]")
        ),
        8000
    );

    try {
        await modalCreate.click();
    } catch {
        await driver.executeScript("arguments[0].click();", modalCreate);
    }

    console.log("➡️ Creando organización…");

    // ======= VALIDAR QUE APAREZCA EN LA LISTA =======
    await driver.sleep(1500);

    const createdOrg = await driver.wait(
        until.elementLocated(
            By.xpath(`//h4[contains(., '${ORG_NAME}')]`)
        ),
        8000
    );

    const visible = await createdOrg.isDisplayed();

    expect(visible).toBe(true);

    console.log(`🎉 Organización '${ORG_NAME}' creada y visible en la lista`);
});
