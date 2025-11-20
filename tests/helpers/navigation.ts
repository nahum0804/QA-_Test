import { WebDriver, By, until } from "selenium-webdriver";

export async function goToOrganizations(driver: WebDriver) {
    console.log("📌 Navegando a selector de organizaciones…");

    // 1) Abrir menú superior
    const orgMenu = await driver.wait(
        until.elementLocated(By.css("button[aria-haspopup='menu']")),
        8000
    );
    await orgMenu.click();
    await driver.sleep(300);

    // 2) Clic en "Switch organization"
    const switchOrg = await driver.wait(
        until.elementLocated(
            By.xpath("//span[contains(., 'Switch organization')]")
        ),
        8000
    );
    await switchOrg.click();
    await driver.sleep(500);

    // 3) Clic en "Create organization" dentro del menú
    const createOption = await driver.wait(
        until.elementLocated(
            By.xpath("//div[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'create organization')]")
        ),
        8000
    );

    console.log("📌 Estamos en vista global de organizaciones");
}
