import { beforeEach, afterEach, test, expect } from "@jest/globals";
import { WebDriver, By, until } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";
import { goToOrganizations } from "../helpers/navigation";

let driver: WebDriver;

beforeEach(async () => {
    driver = await createDriver();
    await login(driver);
    await goToOrganizations(driver);
});

afterEach(async () => {
    await driver.quit();
});

test("TC-ORG-32: Invitar usuario existente por correo (válido)", async () => {
    const firstOrg = By.xpath("(//div[contains(@class,'org') or contains(@class,'item')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    // Ir a Members
    await driver.findElement(By.xpath("//a[contains(., 'Members')]")).click();

    // Hacer click en Invite Member
    await driver.findElement(By.xpath("//button[contains(., 'Invite')]")).click();

    // Completar correo
    const input = driver.findElement(By.css("input[type='email']"));
    await input.sendKeys("user@test.com");   // <--- Ajusta tu correo real de pruebas

    // Enviar
    await driver.findElement(By.xpath("//button[contains(., 'Send')]")).click();

    // Confirmar mensaje de éxito
    const msg = await driver.findElement(By.css(".success, .toast, .notification")).getText();

    expect(msg).toMatch(/sent|invitation|success/i);
});
