import { beforeEach, afterEach, test, jest, expect } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";

let driver: WebDriver;
jest.setTimeout(45000);

beforeEach(async () => {
    driver = await createDriver();
    await login(driver);
}, 25000);

afterEach(async () => {
    if (driver) {
        try { await driver.quit(); } catch {}
    }
}, 15000);


// =======================================================
//  TC-ORG-33: Invitar usuario con correo inválido
// =======================================================
test("TC-ORG-33: No permitir invitar usuarios con correo inválido", async () => {

    // === 1. Ir a Organizations ===
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(900);

    // === 2. Entrar a la primera organización ===
    const orgCards = await driver.wait(
        until.elementsLocated(By.css("ul.grid-box a.card")),
        10000
    );

    const firstOrg = orgCards[0];

    await driver.executeScript("arguments[0].scrollIntoView(true);", firstOrg);
    await driver.sleep(300);

    try { await firstOrg.click(); }
    catch { await driver.executeScript("arguments[0].click();", firstOrg); }

    await driver.sleep(1000);


    // === 3. Ir a Members ===
    const membersTab = await driver.wait(
        until.elementLocated(By.xpath("//a[contains(., 'Members')]")),
        8000
    );

    try { await membersTab.click(); }
    catch { await driver.executeScript("arguments[0].click();", membersTab); }

    await driver.sleep(1000);


    // === 4. Presionar botón Invite ===
    const inviteBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[.//span[contains(text(), 'Invite')]]")),
        8000
    );

    try { await inviteBtn.click(); }
    catch { await driver.executeScript("arguments[0].click();", inviteBtn); }

    await driver.sleep(800);


    // === 5. Ingresar email inválido ===
    const EMAIL_INVALIDO = "usuario@@example";

    const emailInput = await driver.wait(
        until.elementLocated(By.id("email")),
        8000
    );

    await emailInput.clear();
    await emailInput.sendKeys(EMAIL_INVALIDO);

    // Nombre puede ser cualquiera, no afecta validación
    const nameInput = await driver.wait(
        until.elementLocated(By.id("member-name")),
        8000
    );

    await nameInput.clear();
    await nameInput.sendKeys("Usuario Prueba");

    await driver.sleep(500);


    // === 6. Click en Send invite ===
    const sendBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Send invite')]")),
        8000
    );

    // activar en caso de disabled
    await driver.executeScript("arguments[0].disabled = false;", sendBtn);

    try { await sendBtn.click(); }
    catch { await driver.executeScript("arguments[0].click();", sendBtn); }

    await driver.sleep(1200);


    // === 7. Validar mensaje de error exacto ===
    let errorDetected = false;

    try {
        const errorMsg = await driver.wait(
            until.elementLocated(
                By.xpath("//div[contains(@class,'error')]//span[contains(text(), 'Emails should be formatted')]")
            ),
            6000
        );

        if (await errorMsg.isDisplayed()) {
            errorDetected = true;
            console.log("✔ Error detectado: Emails should be formatted as name@example.com");
        }
    } catch (e) {
        console.log("❌ No se encontró el mensaje de error en el modal");
    }

    expect(errorDetected).toBe(true);

    console.log("🎉 Error detectado correctamente: Email inválido no permitido");

});
