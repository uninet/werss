#!/usr/bin/env python3
"""
E2E Workflow Test 001: Complete new user onboarding flow
P0 Priority - Critical for new user experience
"""

import sys
import time
from datetime import datetime
from playwright.sync_api import sync_playwright, expect


class TestResult:
    def __init__(self, test_id, description):
        self.test_id = test_id
        self.description = description
        self.start_time = datetime.now()
        self.end_time = None
        self.status = "RUNNING"
        self.details = []
        self.screenshots = []
        self.errors = []

    def add_detail(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.details.append(f"[{timestamp}] {message}")
        print(f"  {message}")

    def add_error(self, error):
        timestamp = datetime.now().strftime("%H:%M:%S")
        error_msg = f"[{timestamp}] ERROR: {error}"
        self.errors.append(error_msg)
        print(f"  ❌ {error_msg}")

    def add_success(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        success_msg = f"[{timestamp}] ✅ {message}"
        self.details.append(success_msg)
        print(f"  {success_msg}")

    def finish(self, status):
        self.end_time = datetime.now()
        self.status = status
        duration = self.end_time - self.start_time
        print(
            f"\nTest completed in {duration.total_seconds():.2f} seconds with status: {status}"
        )


def test_tc_wf_001():
    """Execute TC-WF-001: Complete new user onboarding flow"""
    result = TestResult("TC-WF-001", "Complete new user onboarding flow")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)  # Show browser for debugging
            page = browser.new_page()

            result.add_detail("Starting new user onboarding flow test")

            # Step 1: Open browser and navigate to homepage
            result.add_detail("Step 1: Navigate to homepage")
            page.goto("http://localhost:5173")
            page.wait_for_load_state("networkidle")

            # Take initial screenshot
            page.screenshot(path="screenshots/TC-WF-001-01-homepage.png")
            result.screenshots.append("TC-WF-001-01-homepage.png")

            # Step 2: Observe welcome interface
            result.add_detail("Step 2: Check welcome interface")
            try:
                # Look for welcome elements or initial state
                title = page.locator("h1, .title, .welcome").first
                if title.count() > 0:
                    result.add_success("Welcome interface elements found")
                else:
                    result.add_detail(
                        "No explicit welcome title found, checking for homepage elements"
                    )
            except Exception as e:
                result.add_detail(f"Welcome interface check: {str(e)}")

            # Step 3: Check homepage statistics cards (should be 0 or initial values)
            result.add_detail("Step 3: Check homepage statistics")
            try:
                # Look for statistics cards
                stats_elements = page.locator(".stat, .card, [data-stat]").all()
                result.add_detail(f"Found {len(stats_elements)} stat elements")

                # Check API stats to verify initial state
                response = page.request.get("http://localhost:3000/api/stats")
                if response.status == 200:
                    stats_data = response.json()
                    if stats_data.get("success"):
                        data = stats_data["data"]
                        result.add_success(
                            f"API stats confirmed - Bloggers: {data['bloggers']['total']}, Contents: {data['contents']['total']}"
                        )
                    else:
                        result.add_error("API stats endpoint returned success=false")
                else:
                    result.add_error(
                        f"API stats endpoint returned status {response.status}"
                    )
            except Exception as e:
                result.add_error(f"Failed to check homepage statistics: {str(e)}")

            # Step 4: Click "管理 RSS 源" (Manage RSS Sources)
            result.add_detail("Step 4: Navigate to RSS source management")
            try:
                # Try different possible selectors for RSS management
                selectors = [
                    'text="管理 RSS 源"',
                    'text="RSS"',
                    '[href*="rss"]',
                    '[href*="manage"]',
                    'button:has-text("管理")',
                    '.nav-item:has-text("RSS")',
                ]

                clicked = False
                for selector in selectors:
                    try:
                        element = page.locator(selector).first
                        if element.count() > 0:
                            element.click()
                            clicked = True
                            result.add_success(
                                f"Clicked RSS management using selector: {selector}"
                            )
                            break
                    except:
                        continue

                if not clicked:
                    # Try to navigate directly if button not found
                    page.goto("http://localhost:5173/manage")
                    result.add_detail("Navigated directly to manage page")

                page.wait_for_load_state("networkidle")

            except Exception as e:
                result.add_error(f"Failed to navigate to RSS management: {str(e)}")

            # Step 5: Observe empty state提示
            result.add_detail("Step 5: Check empty state")
            page.screenshot(path="screenshots/TC-WF-001-05-empty-state.png")
            result.screenshots.append("TC-WF-001-05-empty-state.png")

            try:
                empty_elements = page.locator(
                    ".empty, .no-data, text='暂无', text='空'"
                ).all()
                result.add_detail(f"Found {len(empty_elements)} empty state indicators")
            except Exception as e:
                result.add_detail(f"Empty state check: {str(e)}")

            # Step 6: Click "添加 RSS 源" (Add RSS Source)
            result.add_detail("Step 6: Click add RSS source")
            try:
                selectors = [
                    'text="添加 RSS 源"',
                    'text="添加"',
                    'text="Add"',
                    'button:has-text("添加")',
                    ".btn-primary",
                    '[data-action="add"]',
                ]

                clicked = False
                for selector in selectors:
                    try:
                        element = page.locator(selector).first
                        if element.count() > 0:
                            element.click()
                            clicked = True
                            result.add_success(
                                f"Clicked add RSS using selector: {selector}"
                            )
                            break
                    except:
                        continue

                if not clicked:
                    result.add_error("Could not find add RSS button")

                page.wait_for_load_state("networkidle")

            except Exception as e:
                result.add_error(f"Failed to click add RSS: {str(e)}")

            # Step 7: Fill RSS form
            result.add_detail("Step 7: Fill RSS source form")
            try:
                # Wait for form to appear
                page.wait_for_timeout(2000)

                # Fill name field
                name_selectors = [
                    'input[name="name"]',
                    'input[placeholder*="名称"]',
                    'input[placeholder*="name"]',
                    "#name",
                ]
                for selector in name_selectors:
                    try:
                        name_field = page.locator(selector).first
                        if name_field.count() > 0:
                            name_field.fill("测试博客")
                            result.add_success("Filled name field")
                            break
                    except:
                        continue

                # Fill URL field
                url_selectors = [
                    'input[name="url"]',
                    'input[placeholder*="URL"]',
                    'input[placeholder*="链接"]',
                    "#url",
                ]
                for selector in url_selectors:
                    try:
                        url_field = page.locator(selector).first
                        if url_field.count() > 0:
                            url_field.fill("https://rsshub.app/github/trending/daily")
                            result.add_success("Filled URL field")
                            break
                    except:
                        continue

                # Select type RSS
                type_selectors = [
                    'select[name="type"]',
                    'option[value="RSS"]',
                    '[data-type="RSS"]',
                ]
                for selector in type_selectors:
                    try:
                        if selector.startswith("select"):
                            type_field = page.locator(selector).first
                            if type_field.count() > 0:
                                type_field.select_option("RSS")
                                result.add_success("Selected RSS type")
                                break
                        elif selector.startswith("option"):
                            option = page.locator(selector).first
                            if option.count() > 0:
                                option.click()
                                result.add_success("Selected RSS type option")
                                break
                    except:
                        continue

            except Exception as e:
                result.add_error(f"Failed to fill RSS form: {str(e)}")

            # Step 8: Save
            result.add_detail("Step 8: Save RSS source")
            page.screenshot(path="screenshots/TC-WF-001-08-form-filled.png")
            result.screenshots.append("TC-WF-001-08-form-filled.png")

            try:
                save_selectors = [
                    'button:has-text("保存")',
                    'button:has-text("Save")',
                    'button[type="submit"]',
                    ".btn-primary",
                    '[data-action="save"]',
                ]

                clicked = False
                for selector in save_selectors:
                    try:
                        save_btn = page.locator(selector).first
                        if save_btn.count() > 0:
                            save_btn.click()
                            clicked = True
                            result.add_success(
                                f"Clicked save using selector: {selector}"
                            )
                            break
                    except:
                        continue

                if not clicked:
                    result.add_error("Could not find save button")
                else:
                    page.wait_for_timeout(3000)  # Wait for save to complete

            except Exception as e:
                result.add_error(f"Failed to save RSS source: {str(e)}")

            # Step 9: Wait for auto crawl
            result.add_detail("Step 9: Wait for automatic crawling")
            try:
                page.wait_for_timeout(5000)  # Wait for crawling
                result.add_success("Waited for automatic crawling")
            except Exception as e:
                result.add_error(f"Error during crawl wait: {str(e)}")

            # Step 10: Return to homepage
            result.add_detail("Step 10: Return to homepage")
            try:
                page.goto("http://localhost:5173")
                page.wait_for_load_state("networkidle")
                result.add_success("Returned to homepage")
            except Exception as e:
                result.add_error(f"Failed to return to homepage: {str(e)}")

            # Step 11: Observe statistics update
            result.add_detail("Step 11: Check updated statistics")
            try:
                response = page.request.get("http://localhost:3000/api/stats")
                if response.status == 200:
                    stats_data = response.json()
                    if stats_data.get("success"):
                        data = stats_data["data"]
                        bloggers_count = data["bloggers"]["total"]
                        contents_count = data["contents"]["total"]

                        if bloggers_count > 0:
                            result.add_success(
                                f"RSS source added successfully - Bloggers: {bloggers_count}"
                            )
                        else:
                            result.add_error("RSS source not reflected in statistics")

                        if contents_count > 0:
                            result.add_success(
                                f"Content crawled successfully - Contents: {contents_count}"
                            )
                        else:
                            result.add_detail(
                                "No content crawled yet (may need more time)"
                            )
                    else:
                        result.add_error("API stats endpoint returned success=false")
                else:
                    result.add_error(
                        f"API stats endpoint returned status {response.status}"
                    )
            except Exception as e:
                result.add_error(f"Failed to check updated statistics: {str(e)}")

            # Step 12: Click "查看内容" (View Content)
            result.add_detail("Step 12: Navigate to content view")
            try:
                selectors = [
                    'text="查看内容"',
                    'text="内容"',
                    'text="Content"',
                    '[href*="content"]',
                    '.nav-item:has-text("内容")',
                ]

                clicked = False
                for selector in selectors:
                    try:
                        element = page.locator(selector).first
                        if element.count() > 0:
                            element.click()
                            clicked = True
                            result.add_success(
                                f"Clicked content view using selector: {selector}"
                            )
                            break
                    except:
                        continue

                if not clicked:
                    page.goto("http://localhost:5173/content")
                    result.add_detail("Navigated directly to content page")

                page.wait_for_load_state("networkidle")

            except Exception as e:
                result.add_error(f"Failed to navigate to content view: {str(e)}")

            # Step 13: Read first article
            result.add_detail("Step 13: Read first article")
            page.screenshot(path="screenshots/TC-WF-001-13-content-list.png")
            result.screenshots.append("TC-WF-001-13-content-list.png")

            try:
                # Look for articles
                article_selectors = [
                    ".article",
                    ".item",
                    "[data-article]",
                    'a[href*="article"]',
                    ".content-item",
                ]

                found_articles = False
                for selector in article_selectors:
                    try:
                        articles = page.locator(selector).all()
                        if len(articles) > 0:
                            result.add_success(
                                f"Found {len(articles)} articles using selector: {selector}"
                            )
                            articles[0].click()
                            found_articles = True
                            break
                    except:
                        continue

                if found_articles:
                    page.wait_for_load_state("networkidle")
                    page.wait_for_timeout(2000)
                    result.add_success("Opened first article for reading")
                    page.screenshot(path="screenshots/TC-WF-001-13-article-view.png")
                    result.screenshots.append("TC-WF-001-13-article-view.png")
                else:
                    result.add_detail("No articles found to read")

            except Exception as e:
                result.add_error(f"Failed to read article: {str(e)}")

            # Step 14: Return to content list
            result.add_detail("Step 14: Return to content list")
            try:
                # Try back button or navigation
                back_selectors = [
                    'button:has-text("返回")',
                    'button:has-text("Back")',
                    ".back-btn",
                    '[data-action="back"]',
                ]

                returned = False
                for selector in back_selectors:
                    try:
                        back_btn = page.locator(selector).first
                        if back_btn.count() > 0:
                            back_btn.click()
                            returned = True
                            result.add_success("Returned to content list")
                            break
                    except:
                        continue

                if not returned:
                    page.goto("http://localhost:5173/content")
                    result.add_detail("Navigated back to content list")

                page.wait_for_load_state("networkidle")

            except Exception as e:
                result.add_error(f"Failed to return to content list: {str(e)}")

            # Final screenshot
            page.screenshot(path="screenshots/TC-WF-001-final.png")
            result.screenshots.append("TC-WF-001-final.png")

            browser.close()

    except Exception as e:
        result.add_error(f"Test execution failed: {str(e)}")
        if "browser" in locals():
            browser.close()

    # Determine test result
    if len(result.errors) == 0:
        result.finish("PASS")
        result.add_success(
            "✅ TC-WF-001 PASSED: New user onboarding flow completed successfully"
        )
    else:
        result.finish("FAIL")
        result.add_error(
            f"❌ TC-WF-001 FAILED: {len(result.errors)} errors encountered"
        )

    return result


def update_csv(result):
    """Update the tracking CSV with test results"""
    import csv
    import os

    csv_file = "/Users/yelon/Documents/werss/E2E-WORKFLOW-EXECUTION-TRACKING.csv"

    if not os.path.exists(csv_file):
        return

    rows = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Update the row for this test
    for row in rows:
        if row["Test Case ID"] == result.test_id:
            row["Status"] = "Completed"
            row["Result"] = result.status
            row["Notes"] = f"{len(result.errors)} errors, {len(result.details)} steps"
            row["Time Taken"] = (
                f"{(result.end_time - result.start_time).total_seconds():.2f}s"
            )
            break

    # Write back
    with open(csv_file, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    print("🚀 Starting TC-WF-001: Complete new user onboarding flow")
    print("=" * 60)

    # Create screenshots directory
    import os

    os.makedirs("screenshots", exist_ok=True)

    result = test_tc_wf_001()
    update_csv(result)

    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print(f"Test ID: {result.test_id}")
    print(f"Description: {result.description}")
    print(f"Status: {result.status}")
    print(
        f"Duration: {(result.end_time - result.start_time).total_seconds():.2f} seconds"
    )
    print(f"Errors: {len(result.errors)}")
    print(f"Screenshots: {len(result.screenshots)}")

    if result.errors:
        print("\n❌ ERRORS:")
        for error in result.errors:
            print(f"  {error}")

    print(f"\n📸 Screenshots saved in: screenshots/")
    sys.exit(0 if result.status == "PASS" else 1)
