import { expect, test } from '@playwright/test'

// One end-to-end pass over the core journey: register, create a project, add a
// task, move it to done, then sign out and back in to confirm it persisted.
test('register, manage a project and tasks, then sign back in', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`
  const password = 'supersecret'

  await test.step('register', async () => {
    await page.goto('/register')
    await page.getByLabel('Name').fill('E2E User')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL(/\/projects$/)
  })

  await test.step('create a project', async () => {
    await page.getByRole('button', { name: 'New project' }).first().click()
    await page.getByLabel('Name').fill('Launch plan')
    await page.getByRole('button', { name: 'Create project' }).click()
    await expect(page.getByRole('heading', { name: 'Launch plan' })).toBeVisible()
  })

  await test.step('open the project and add a task', async () => {
    await page.getByRole('heading', { name: 'Launch plan' }).click()
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/)

    await page.getByRole('button', { name: 'Add task' }).click()
    await page.getByLabel('Title').fill('Draft the announcement')
    await page.getByRole('button', { name: 'Create task' }).click()
    await expect(page.getByText('Draft the announcement')).toBeVisible()
  })

  await test.step('move the task to done', async () => {
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Done' }).click()
    // The task's status control (not the filter button) now reads "Done".
    await expect(page.getByRole('combobox')).toContainText('Done')
  })

  await test.step('sign out and back in', async () => {
    await page.getByRole('button', { name: 'Account menu' }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.getByRole('heading', { name: 'Launch plan' })).toBeVisible()
  })
})
