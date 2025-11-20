import { By, until, WebDriver } from "selenium-webdriver";
import { QA_EMAIL, QA_PASSWORD } from "./env";
import { BASE_URL } from "../../src/config";

export async function login(driver: WebDriver) {
    // Ir a la pantalla de login
    await driver.sleep(1200); // evita rate limit

    await driver.get(`${BASE_URL}/auth/sign-in`);

    // Esperar input email
    await driver.wait(until.elementLocated(By.id("email")), 10000);
    await driver.findElement(By.id("email")).clear();
    await driver.findElement(By.id("email")).sendKeys(QA_EMAIL);

    // Esperar input password
    await driver.wait(until.elementLocated(By.id("password")), 10000);
    await driver.findElement(By.id("password")).clear();
    await driver.findElement(By.id("password")).sendKeys(QA_PASSWORD);

    // Clic en Sign in
    await driver.findElement(
        By.xpath("//button[@type='submit' and contains(., 'Sign in')]")
    ).click();

    // Esperar a que cargue la consola (cualquier elemento distintivo)
    await driver.wait(
        until.elementLocated(By.css("nav, header, .project-card, .workspace")),
        15000
    );
}
