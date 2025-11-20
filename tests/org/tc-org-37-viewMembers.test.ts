import { beforeEach, afterEach, test, jest, expect } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";

let driver: WebDriver;
jest.setTimeout(35000);

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
//  TC-ORG-37: Consultar miembros de una organización
// =======================================================
test("TC-ORG-37: Mostrar lista de miembros correctamente", async () => {

    // === 1. Ir a Organizations ===
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(900);

    // === 2. Abrir la primera organización ===
    const orgCards = await driver.wait(
        until.elementsLocated(By.css("ul.grid-box a.card")),
        8000
    );

    const firstOrg = orgCards[0];

    await driver.executeScript("arguments[0].scrollIntoView(true);", firstOrg);
    await driver.sleep(200);

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

    await driver.sleep(900);


   // === 4. Validar lista de miembros ===
    const memberRows = await driver.wait(
        until.elementsLocated(
            By.xpath("//div[@role='table']/div[@role='row']")
        ),
        8000
    );

    // Debe haber al menos 1 miembro
    expect(memberRows.length).toBeGreaterThan(0);

    console.log("🎉 Lista de miembros mostrada correctamente. Total:", memberRows.length);

});
