import { beforeEach, afterEach, test, expect } from "@jest/globals";
import { WebDriver, By } from "selenium-webdriver";
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

test("TC-ORG-21: Crear organización con nombre vacío", async () => {
    await driver.findElement(By.xpath("//button[contains(., 'Create Organization')]")).click();

    await driver.findElement(By.id("organizationName")).sendKeys("");

    await driver.findElement(By.xpath("//button[contains(., 'Create')]")).click();

    const err = await driver.findElement(By.css(".error-message")).getText();

    expect(err).toContain("required");
});
