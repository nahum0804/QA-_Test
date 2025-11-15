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

test("TC-ORG-36: Remover miembro válido", async () => {
    const firstOrg = By.xpath("(//div[contains(@class,'org')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    await driver.findElement(By.xpath("//a[contains(., 'Members')]")).click();

    const memberRow = By.xpath("(//div[contains(@class,'member')])[2]");
    await driver.wait(until.elementLocated(memberRow), 15000);

    await driver.findElement(By.xpath("//button[contains(., 'Remove')]")).click();
    await driver.findElement(By.xpath("//button[contains(., 'Confirm')]")).click();

    const msg = await driver.findElement(By.css(".success, .toast")).getText();

    expect(msg).toMatch(/removed|success/i);
});
