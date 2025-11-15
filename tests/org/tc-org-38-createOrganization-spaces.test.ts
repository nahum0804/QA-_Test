import { beforeEach, afterEach, test, expect } from "@jest/globals";
import { By, until, WebDriver } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";
import { goToOrganizations } from "../helpers/navigation";

let driver: WebDriver;

beforeEach(async () => {
    driver = await createDriver();
    await login(driver); // MISMO LOGIN
    await goToOrganizations(driver);
});

afterEach(async () => driver.quit());

test("TC-ORG-38: Crear organización con nombre solo espacios (inválido)", async () => {
    await driver.findElement(By.xpath("//button[contains(., 'Create Organization')]")).click();

    await driver.findElement(By.id("organizationName")).sendKeys("     ");

    await driver.findElement(By.xpath("//button[contains(., 'Create')]")).click();

    const error = await driver.findElement(By.css(".error-message")).getText();

    expect(error).toMatch(/blank|spaces|invalid/i);
});
