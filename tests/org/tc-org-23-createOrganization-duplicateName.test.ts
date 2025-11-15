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

test("TC-ORG-23: Crear organización duplicada", async () => {
    await driver.findElement(By.xpath("//button[contains(., 'Create Organization')]")).click();

    await driver.findElement(By.id("organizationName")).sendKeys("QA Test Org");

    await driver.findElement(By.xpath("//button[contains(., 'Create')]")).click();

    const err = await driver.findElement(By.css(".error-message")).getText();

    expect(err).toMatch(/exists|already/i);
});
