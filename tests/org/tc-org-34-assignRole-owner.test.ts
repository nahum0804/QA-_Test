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

test("TC-ORG-34: Asignar rol 'Owner' a un miembro existente (válido)", async () => {
    const firstOrg = By.xpath("(//div[contains(@class,'org') or contains(@class,'item')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    await driver.findElement(By.xpath("//a[contains(., 'Members')]")).click();

    // Seleccionar el primer miembro
    const firstMember = By.xpath("(//div[contains(@class,'member') or contains(@class,'item')])[1]");
    await driver.wait(until.elementLocated(firstMember), 15000).click();

    // Abrir edición de rol
    await driver.findElement(By.xpath("//button[contains(., 'Edit Role')]")).click();

    // Seleccionar Owner
    await driver.findElement(By.xpath("//option[contains(., 'Owner')]")).click();

    // Guardar
    await driver.findElement(By.xpath("//button[contains(., 'Save')]")).click();

    // Validar rol
    const text = await driver.findElement(firstMember).getText();

    expect(text).toMatch(/owner/i);
});
