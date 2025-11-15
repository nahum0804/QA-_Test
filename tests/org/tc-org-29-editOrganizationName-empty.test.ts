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

test("TC-ORG-29: Editar nombre de organización a vacío (inválido)", async () => {
    const firstOrg = By.xpath("(//div[contains(@class, 'org') or contains(@class, 'item')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    await driver.findElement(By.xpath("//button[contains(., 'Edit')]")).click();

    const input = driver.findElement(By.id("organizationName"));

    await input.clear();
    await input.sendKeys("");

    await driver.findElement(By.xpath("//button[contains(., 'Save')]")).click();

    const error = await driver.findElement(By.css(".error-message")).getText();

    expect(error).toMatch(/empty|required|cannot/i);
});
