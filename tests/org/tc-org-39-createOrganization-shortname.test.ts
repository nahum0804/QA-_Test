import { beforeEach, afterEach, test, expect } from "@jest/globals";
import { By, until, WebDriver } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";
import { goToOrganizations } from "../helpers/navigation";

let driver: WebDriver;

beforeEach(async () => {
    driver = await createDriver();
    await login(driver);
    await goToOrganizations(driver);
});

afterEach(async () => driver.quit());

test("TC-ORG-39: Crear organización con nombre muy corto (<3 chars) - Válido", async () => {
    await driver.findElement(By.xpath("//button[contains(., 'Create Organization')]")).click();

    await driver.findElement(By.id("organizationName")).sendKeys("AB");
    await driver.findElement(By.xpath("//button[contains(., 'Create')]")).click();

    // Esperar toast de éxito o mensaje
    const successMsg = await driver
        .wait(until.elementLocated(By.css(".toast.success, .success-message")), 15000)
        .getText();

    expect(successMsg.toLowerCase()).toMatch(/created|success/i);

    // Verificar que aparece en la lista
    const newOrg = await driver.findElement(
        By.xpath("//div[contains(@class,'org') and contains(., 'AB')]")
    );

    expect(newOrg).toBeTruthy();
});
