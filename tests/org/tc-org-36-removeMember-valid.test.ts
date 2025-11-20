import { beforeEach, afterEach, test, expect, jest } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";

let driver: WebDriver;
jest.setTimeout(45000);

beforeEach(async () => {
    driver = await createDriver();
    await login(driver);
}, 20000);

afterEach(async () => {
    if (driver) {
        try { await driver.quit(); } catch {}
    }
}, 15000);

test("TC-ORG-36: No permitir eliminar único miembro de la organización", async () => {

    console.log("➡️ Abriendo lista de organizaciones…");
    await driver.get("http://localhost/console/account/organizations");

    // ================================
    // 1️⃣ Entrar a la primera organización
    // ================================
    const firstOrg = await driver.wait(
        until.elementLocated(By.css("ul.grid-box a.card")),
        8000
    );

    await firstOrg.click();
    console.log("✔ Organización abierta");

    // ================================
    // 2️⃣ Ir a Members
    // ================================
    const membersTab = await driver.wait(
        until.elementLocated(By.xpath("//a[contains(text(),'Members')]")),
        8000
    );

    await membersTab.click();
    await driver.sleep(800);

    console.log("✔ Se abrió Members");

    // ================================
    // 3️⃣ Contar miembros
    // ================================
    const rows = await driver.wait(
        until.elementsLocated(By.css(".root [role='row']")),
        8000
    );

    console.log("Miembros encontrados:", rows.length);

    if (rows.length !== 1) {
        throw new Error("❌ Esta versión de la prueba es para organizaciones con EXACTAMENTE 1 miembro.");
    }

    // ================================
    // 4️⃣ Abrir menú "..."
    // ================================
    const menuBtn = await rows[0].findElement(
        By.css("button.icon.s.ghost")
    );

    try {
        await menuBtn.click();
    } catch {
        await driver.executeScript("arguments[0].click();", menuBtn);
    }

    console.log("✔ Menú abierto");

    // ================================
    // 5️⃣ Verificar que NO exista el botón Leave (no se puede eliminar)
    // ================================
    let leaveExists = true;

    try {
        await driver.wait(
            until.elementLocated(By.xpath("//button[contains(.,'Leave')]")),
            3000
        );
        leaveExists = true;
    } catch {
        leaveExists = false; // NO existe → Correcto
    }

    console.log("¿Botón Leave aparece?:", leaveExists);

    // ================================
    // 6️⃣ Validación final
    // ================================
    expect(leaveExists).toBe(false);

    console.log("🎉 No se puede eliminar al único miembro → Comportamiento correcto");

});
