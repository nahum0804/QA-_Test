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

test("TC-ORG-23: Crear organización duplicada", async () => {

    const ORG_NAME = "QA_DUPLICATE_TEST";

    // --------------------------------------------------------------------
    // 🔹 1) PRIMERA CREACIÓN (idéntica al TC-22)
    // --------------------------------------------------------------------
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

    console.log("✔ Nombre seteado por JS:", ORG_NAME);

    const modalCreate = await driver.wait(
        until.elementLocated(
            By.xpath("//button[@type='submit' and contains(., 'Create')]")
        ),
        8000
    );

    try { 
        await modalCreate.click();
        console.log("✔ Primera creación OK");
    } catch {
        console.log("⚠ JS click en CREATE");
        await driver.executeScript("arguments[0].click();", modalCreate);
    }

    // 🚫 No validamos nada más, seguimos flotando igual que en TC-22
    await driver.sleep(1200);


    // --------------------------------------------------------------------
    // 🔹 2) SEGUNDA CREACIÓN (mismo flujo, mismo nombre)
    // --------------------------------------------------------------------

    // Volver a organizaciones
    await goToOrganizations(driver);

    // Reabrir modal de creación
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
    await driver.sleep(200);

    try { 
        await createBtn.click(); 
    } catch {
        await driver.executeScript("arguments[0].click();", createBtn);
    }

    await driver.sleep(800);

    const nameInput2 = await driver.wait(
        until.elementLocated(By.id("organization-name")),
        8000
    );

    await driver.executeScript("arguments[0].focus();", nameInput2);
    await driver.sleep(100);
    await driver.executeScript("arguments[0].value='';", nameInput2);

    await driver.executeScript(`
        arguments[0].value = arguments[1];
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
    `, nameInput2, ORG_NAME);

    console.log("✔ Segundo intento con nombre duplicado:", ORG_NAME);

    const modalCreate2 = await driver.wait(
        until.elementLocated(
            By.xpath("//button[@type='submit' and contains(., 'Create')]")
        ),
        8000
    );

    // Intento de crear duplicado
    try {
        await modalCreate2.click();
    } catch {
        await driver.executeScript("arguments[0].click();", modalCreate2);
    }

    // --------------------------------------------------------------------
    // 🔍 3) Capturar el error de duplicado — sin navegar ni validar nada más
    // --------------------------------------------------------------------
    const error = await driver.wait(
        until.elementLocated(
            By.xpath(
                "//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'already') or " +
                "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'duplicate') or " +
                "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), 'exist')]"
            )
        ),
        8000
    );

    const errText = (await error.getText()).toLowerCase();
    console.log("❗ Error recibido:", errText);

    expect(
        errText.includes("already") ||
        errText.includes("duplicate") ||
        errText.includes("exist")
    ).toBe(true);

    console.log("🎉 Error de duplicado detectado correctamente");
});
