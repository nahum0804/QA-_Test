import { By, until, WebDriver } from "selenium-webdriver";

export async function goToOrganizations(driver: WebDriver) {
    const locator = By.xpath(
        "//a[contains(., 'Organizations') or contains(., 'Groups')]"
    );

    await driver.wait(until.elementLocated(locator), 15000).click();
    await driver.sleep(800); // deja que cargue la UI
}
