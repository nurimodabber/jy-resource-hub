import { chromium } from 'playwright';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  console.log('Navigating and seeding localStorage...');
  await page.goto('http://localhost:3000/tools/teams');
  await page.evaluate(() => {
    const names = ['Musonda', 'Rosa', 'Amir', 'Maya', 'Tahir', 'Layla', 'Navid'];
    localStorage.setItem('jy_group_names', JSON.stringify(names));
    const present = {};
    names.forEach((n) => (present[n] = true));
    localStorage.setItem('jy_group_present', JSON.stringify(present));
    localStorage.setItem('jy_teams_split_mode', JSON.stringify('bySize'));
    localStorage.setItem('jy_teams_team_size', '2');
    localStorage.setItem('jy_teams_round', '1');
    localStorage.removeItem('jy_teams_last_split');
    localStorage.removeItem('jy_teams_has_manual_edits');
    localStorage.removeItem('jy_teams_seen');
  });

  await page.goto('http://localhost:3000/tools/teams', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Check initial state and Round counter
  const roundBadge = page.locator('span:has-text("Runde 1")').first();
  await roundBadge.waitFor({ state: 'visible', timeout: 5000 });
  const roundText = await roundBadge.textContent();
  console.log('Found round badge:', roundText);
  if (!roundText) throw new Error('Round badge not found');

  // 2. Test Shuffle -> round increment & undo
  console.log('Testing mobile shuffle button...');
  const mobileShuffleBtn = page.locator('button:has-text("Neu mischen"):visible');
  await mobileShuffleBtn.click();
  await page.waitForTimeout(300);

  const round2Badge = page.locator('span:has-text("Runde 2")').first();
  await round2Badge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Round incremented to 2 after shuffle');

  // Check Undo button is now active
  const undoBtn = page.locator('button[aria-label="Rückgängig"]:visible').first();
  const isUndoDisabled = await undoBtn.isDisabled();
  console.log('Is Undo button disabled after shuffle?', isUndoDisabled);
  if (isUndoDisabled) throw new Error('Undo button should be enabled after shuffle');

  // Click Undo
  await undoBtn.click();
  await page.waitForTimeout(300);

  await roundBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Round restored to 1 after Undo');

  // 3. Test "Paarungs-Verlauf zurücksetzen"
  // Shuffle twice so round is > 1
  await mobileShuffleBtn.click();
  await page.waitForTimeout(200);
  await mobileShuffleBtn.click();
  await page.waitForTimeout(200);
  const round3Badge = page.locator('span:has-text("Runde 3")').first();
  await round3Badge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Round after two shuffles is 3');

  const resetHistoryBtn = page.locator('button:has-text("Paarungs-Verlauf zurücksetzen")');
  await resetHistoryBtn.scrollIntoViewIfNeeded();
  await resetHistoryBtn.click();
  await page.waitForTimeout(300);

  await roundBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Round successfully reset to 1 after resetting history');

  // 4. Test "Gruppe zeigen" Fullscreen
  const showGroupBtn = page.locator('button:has-text("Gruppe zeigen")');
  await showGroupBtn.scrollIntoViewIfNeeded();
  await showGroupBtn.click();
  await page.waitForTimeout(300);

  const fullscreenView = page.locator('[aria-label="Großansicht für die Gruppe"]');
  const isFullscreenVisible = await fullscreenView.isVisible();
  console.log('Is "Gruppe zeigen" fullscreen visible?', isFullscreenVisible);
  if (!isFullscreenVisible) throw new Error('Fullscreen view not visible');

  // Close with X button
  const closeBtn = fullscreenView.locator('button[aria-label="Schließen"]');
  await closeBtn.click();
  await page.waitForTimeout(300);
  const isFullscreenClosed = !(await fullscreenView.isVisible());
  console.log('Is fullscreen view closed after clicking X?', isFullscreenClosed);
  if (!isFullscreenClosed) throw new Error('Fullscreen view did not close with X');

  // Reopen and test close with Escape
  await showGroupBtn.click();
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const isEscClosed = !(await fullscreenView.isVisible());
  console.log('Is fullscreen view closed after Esc?', isEscClosed);
  if (!isEscClosed) throw new Error('Fullscreen view did not close with Escape');

  // 5. Test Duplicate Name Handling
  const nameInput = page.locator('input[placeholder="+ Name"]');
  await nameInput.scrollIntoViewIfNeeded();
  
  // Find an existing name from the chips: "Musonda"
  const existingName = 'Musonda';

  // Type the duplicate name and press Enter
  await nameInput.fill(existingName);
  await nameInput.press('Enter');
  await page.waitForTimeout(300);

  // Check that duplicate confirmation Dialog appears
  const dialogTitle = page.locator('h2:has-text("Name bereits vorhanden")');
  const isDialogVisible = await dialogTitle.isVisible();
  console.log('Duplicate dialog visible?', isDialogVisible);
  if (!isDialogVisible) throw new Error('Duplicate dialog did not appear');

  // Test Cancel
  const cancelBtn = page.locator('button:has-text("Abbrechen")').last();
  await cancelBtn.click();
  await page.waitForTimeout(300);
  const isDialogClosed = !(await dialogTitle.isVisible());
  console.log('Duplicate dialog closed on Cancel?', isDialogClosed);

  // Re-enter and confirm
  await nameInput.fill(existingName);
  await nameInput.press('Enter');
  await page.waitForTimeout(300);
  const confirmBtn = page.locator('button:has-text("Ja, als")');
  await confirmBtn.click();
  await page.waitForTimeout(300);

  // Check that candidate name "Musonda 2" was added to chips
  const newChip = page.locator('span.truncate:has-text("Musonda 2")').first();
  const isNewChipVisible = await newChip.isVisible();
  console.log(`Was "${existingName} 2" added successfully?`, isNewChipVisible);
  if (!isNewChipVisible) throw new Error(`Expected "${existingName} 2" to be added`);

  console.log('✅ ALL TEIL 3 TESTS PASSED PERFECTLY!');
  await browser.close();
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
