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

test("TC-ORG-33: Invitar usuario con correo no válido (inválido)", async () => {
    const firstOrg = By.xpath("(//div[contains(@class,'org') or contains(@class,'item')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    await driver.findElement(By.xpath("//a[contains(., 'Members')]")).click();

    await driver.findElement(By.xpath("//button[contains(., 'Invite')]")).click();

    const input = driver.findElement(By.css("input[type='email']"));
    await input.sendKeys("usuario@@example");

    await driver.findElement(By.xpath("//button[contains(., 'Send')]")).click();

    const error = await driver.findElement(By.css(".error-message, .toast.error")).getText();

    expect(error).toMatch(/invalid|email/i);
});
