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

test("TC-ORG-27: Ver detalles de una organización existente", async () => {
    // Click en la primera organización de la lista
    const firstOrg = By.xpath("(//div[contains(@class, 'org') or contains(@class, 'item')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    // Esperar vista de detalles
    const detailSection = By.xpath(
        "//h1 | //h2 | //div[contains(., 'Members')] | //div[contains(., 'Projects')]"
    );
    await driver.wait(until.elementLocated(detailSection), 15000);

    const pageText = await driver.findElement(detailSection).getText();

    expect(pageText.length).toBeGreaterThan(0);
});
