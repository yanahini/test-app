import { createBdd } from 'playwright-bdd';
import { expect, test } from '../fixtures/test';

const { When, Then } = createBdd(test);

When('I open the menu', async ({ ui }) => {
  await ui.menu.open.click();
  await expect(ui.menu.item('All Items')).toBeVisible();
});

When('I choose {string} from the menu', async ({ ui }, label: string) => {
  await ui.menu.open.click();
  await ui.menu.item(label).click();
});

When('I log out', async ({ ui }) => {
  await ui.menu.open.click();
  await ui.menu.item('Logout').click();
});

When('I reset the app state', async ({ ui }) => {
  await ui.menu.open.click();
  await ui.menu.item('Reset App State').click();
  await ui.menu.close.click();
});

Then('the {string} menu link should point to {string}', async ({ ui }, label: string, url: string) => {
  await expect(ui.menu.item(label)).toHaveAttribute('href', url);
});
