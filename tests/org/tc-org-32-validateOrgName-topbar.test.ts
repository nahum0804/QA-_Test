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

test("TC-ORG-32: El nombre de la organización se muestra correctamente en la barra superior", async () => {
    
    console.log("➡️ Navegando a /console/account/organizations...");
    await driver.get("http://localhost/console/account/organizations");
    await driver.sleep(1000);

    console.log("🔎 Buscando la primera organización…");
    const firstOrg = await driver.wait(
        until.elementLocated(By.css("ul.grid-box a.card")),
        8000
    );

    // Obtener el nombre que aparece en el card
    const orgNameElement = await firstOrg.findElement(By.css("h4.s"));
    const orgName = await orgNameElement.getText();
    console.log("📌 Nombre esperado:", orgName);

    // Entrar a la organización
    try {
        await firstOrg.click();
    } catch {
        await driver.executeScript("arguments[0].click();", firstOrg);
    }
    await driver.sleep(1200);

    console.log("🔎 Verificando nombre en la barra superior…");

    // Selector del top bar (donde aparece el nombre de la organización)
    const topNameEl = await driver.wait(
        until.elementLocated(
            By.xpath("//h1[contains(@class,'s') or contains(@class,'title') or contains(text(), '')]")
        ),
        8000
    );

    const topName = await topNameEl.getText();
    console.log("📌 Nombre mostrado:", topName);

    // Validación
    expect(topName.trim()).toBe(orgName.trim());

    console.log("🎉 El nombre de la organización coincide en la barra superior");
});
