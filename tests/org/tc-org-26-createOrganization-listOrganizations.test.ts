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

test("TC-ORG-26: Consultar lista de organizaciones existentes", async () => {
    // Esperar lista cargada
    const listLocator = By.css("[class*='org'], [class*='list']");
    await driver.wait(until.elementLocated(listLocator), 15000);

    const listText = await driver.findElement(listLocator).getText();

    expect(listText.length).toBeGreaterThan(0);
});
