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

test("TC-ORG-35: Intentar cambiar el rol del OWNER (inválido)", async () => {
    const firstOrg = By.xpath("(//div[contains(@class,'org')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    await driver.findElement(By.xpath("//a[contains(., 'Members')]")).click();

    // Seleccionar al OWNER (siempre es el primero en la lista)
    const ownerRow = By.xpath("(//div[contains(@class,'member')])[1]");
    await driver.wait(until.elementLocated(ownerRow), 15000).click();

    await driver.findElement(By.xpath("//button[contains(., 'Edit Role')]")).click();

    const error = await driver.findElement(By.css(".error-message, .toast.error")).getText();

    expect(error).toMatch(/permission|denied|owner/i);
});
