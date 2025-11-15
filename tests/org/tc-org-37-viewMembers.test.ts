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

test("TC-ORG-37: Consultar miembros de una organización", async () => {
    const firstOrg = By.xpath("(//div[contains(@class,'org')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    await driver.findElement(By.xpath("//a[contains(., 'Members')]")).click();

    const members = await driver.findElements(
        By.xpath("//div[contains(@class,'member')]")
    );

    expect(members.length).toBeGreaterThan(0);
});
