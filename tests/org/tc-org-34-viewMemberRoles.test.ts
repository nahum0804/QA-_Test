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

test("TC-ORG-34: Validar que los miembros muestran correctamente su rol", async () => {

    console.log("➡️ Navegando a /console/account/organizations…");
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(1000);

    console.log("🔎 Seleccionando primera organización…");
    const firstOrg = await driver.wait(
        until.elementLocated(By.css("ul.grid-box a.card")),
        8000
    );

    const orgNameElement = await firstOrg.findElement(By.css("h4.s"));
    const orgName = await orgNameElement.getText();
    console.log("📌 Organización seleccionada:", orgName);

    // Entrar
    try {
        await firstOrg.click();
    } catch {
        await driver.executeScript("arguments[0].click();", firstOrg);
    }
    await driver.sleep(1200);

    console.log("📁 Abriendo pestaña Members…");
    const membersTab = await driver.wait(
        until.elementLocated(
            By.xpath("//a[contains(., 'Members') and contains(@class,'tab')]")
        ),
        8000
    );

    try {
        await membersTab.click();
    } catch {
        await driver.executeScript("arguments[0].click();", membersTab);
    }

    await driver.sleep(1000);

    console.log("🔎 Buscando tabla de miembros…");
    const rows = await driver.wait(
        until.elementsLocated(By.xpath("//div[@role='row' or @role='rowheader']")),
        8000
    );

    // Filtrar filas que contengan miembros reales
    const memberRows = rows.slice(1); // la primera fila es encabezado

    expect(memberRows.length).toBeGreaterThan(0);
    console.log(`📌 Miembros encontrados: ${memberRows.length}`);

    console.log("🔍 Extrayendo información de roles…");

    let foundRole = false;

    for (let row of memberRows) {
        try {
            const roleCell = await row.findElement(
                By.xpath(".//div[@role='cell'][contains(., 'Owner') or contains(., 'Member')]")
            );

            const roleText = (await roleCell.getText()).trim();
            console.log("➡️ Rol encontrado:", roleText);

            if (roleText === "Owner" || roleText === "Member") {
                foundRole = true;
                break;
            }

        } catch (err) {
            // No contiene rol, continuar
        }
    }

    expect(foundRole).toBe(true);

    console.log("🎉 Los roles de los miembros se muestran correctamente");
});
