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

test("TC-ORG-30: Eliminar organización sin proyectos asociados (válido)", async () => {
    const firstOrg = By.xpath("(//div[contains(@class, 'org') or contains(@class, 'item')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    await driver.findElement(By.xpath("//button[contains(., 'Delete')]")).click();

    // Confirmación
    await driver.findElement(By.xpath("//button[contains(., 'Confirm')]")).click();

    const msg = await driver.findElement(By.css(".success, .toast, .notification")).getText();

    expect(msg).toMatch(/deleted|success/i);
});
