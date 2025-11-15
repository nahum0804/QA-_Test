import { By, until, WebDriver } from "selenium-webdriver";
import { BASE_URL } from "../../src/config";
import { QA_EMAIL, QA_PASSWORD } from "./env";

export async function login(driver: WebDriver) {
    await driver.get(`${BASE_URL}/login`);

    await driver.findElement(By.id("email")).sendKeys(QA_EMAIL);
    await driver.findElement(By.id("password")).sendKeys(QA_PASSWORD);

    await driver.findElement(By.css("button[type='submit']")).click();

    // Asegurarse que entró al dashboard
    await driver.wait(
        until.elementLocated(By.css("nav, .side-nav")),
        10000
    );
}
