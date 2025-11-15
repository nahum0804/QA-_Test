import { beforeEach, afterEach, test, expect } from "@jest/globals";
import { By, until, WebDriver } from "selenium-webdriver";
import { createDriver } from "../../src/driverFactory";
import { login } from "../helpers/login";
import { goToOrganizations } from "../helpers/navigation";

let driver: WebDriver;

beforeEach(async () => {
    driver = await createDriver();
    await login(driver);
    await goToOrganizations(driver);
});

afterEach(async () => driver.quit());

test("TC-ORG-40: Intentar eliminar organización sin permisos (inválido)", async () => {
    // Entrar a primera organización (que normalmente tiene proyectos)
    const firstOrg = By.xpath("(//div[contains(@class,'org')])[1]");
    await driver.wait(until.elementLocated(firstOrg), 15000).click();

    await driver.findElement(By.xpath("//button[contains(., 'Delete')]")).click();

    // Confirmar intento de borrado
    await driver.findElement(By.xpath("//button[contains(., 'Confirm')]")).click();

    // Capturar error
    const error = await driver
        .wait(until.elementLocated(By.css(".toast.error, .error-message")), 15000)
        .getText();

    expect(error.toLowerCase()).toMatch(/denied|cannot|owner/i);
});
