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

test("TC-ORG-22: Crear organización con nombre válido", async () => {
    await driver.findElement(By.xpath("//button[contains(., 'Create Organization')]")).click();

    await driver.findElement(By.id("organizationName")).sendKeys("QA Test Org");

    await driver.findElement(By.xpath("//button[contains(., 'Create')]")).click();

    const list = await driver.findElement(By.css("[class*='org'], [class*='list']")).getText();

    expect(list).toContain("QA Test Org");
});
