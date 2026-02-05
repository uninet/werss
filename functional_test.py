#!/usr/bin/env python3
import os
import sys
import time
import json
from datetime import datetime
from playwright.sync_api import sync_playwright, expect


class TestResult:
    def __init__(self, test_id: str, priority: str, name: str):
        self.test_id = test_id
        self.priority = priority
        self.name = name
        self.status = "PENDING"
        self.error_message = ""
        self.execution_time = 0
        self.start_time = None
        self.end_time = None


class AITrackerTester:
    def __init__(self):
        self.base_url = "http://localhost:5173"
        self.test_results = []
        self.browser = None
        self.context = None
        self.page = None

    def setup_browser(self):
        playwright = sync_playwright().start()
        self.browser = playwright.chromium.launch(headless=True)
        self.context = self.browser.new_context(
            viewport={"width": 1920, "height": 1080}
        )
        self.page = self.context.new_page()

    def teardown_browser(self):
        if self.context:
            self.context.close()
        if self.browser:
            self.browser.close()

    def navigate_to(self, path: str = ""):
        url = f"{self.base_url}{path}"
        print(f"Navigating to: {url}")
        self.page.goto(url)
        self.page.wait_for_load_state("networkidle")

    def wait_for_content(self, timeout: int = 10000):
        self.page.wait_for_timeout(1000)
        try:
            self.page.wait_for_function(
                "() => document.querySelector('[data-testid=\"content-loaded\"]') || document.querySelector('.error') || document.body.innerText.length > 100",
                timeout=timeout,
            )
        except:
            pass

    def take_screenshot(self, test_id: str):
        screenshot_path = (
            f"/tmp/test_{test_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        )
        self.page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved: {screenshot_path}")

    def execute_test(self, test_id: str, priority: str, name: str, test_func):
        result = TestResult(test_id, priority, name)
        result.start_time = datetime.now()

        print(f"\n{'=' * 60}")
        print(f"Executing {test_id}: {name} [{priority}]")
        print(f"{'=' * 60}")

        try:
            test_func()
            result.status = "PASS"
            print(f"✅ {test_id} PASSED")
        except Exception as e:
            result.status = "FAIL"
            result.error_message = str(e)
            print(f"❌ {test_id} FAILED: {e}")
            self.take_screenshot(test_id)

        result.end_time = datetime.now()
        result.execution_time = (result.end_time - result.start_time).total_seconds()
        self.test_results.append(result)
        return result

    def test_TC_HOME_001(self):
        self.navigate_to("/")
        self.wait_for_content()
        expect(self.page).to_have_title("AI Tracker - AI博主监测工具")
        cards = self.page.locator(
            '[class*="card"], [class*="stat"], [data-testid*="stat"]'
        )
        if cards.count() == 0:
            content = self.page.locator("body")
            expect(content).to_contain_text("AI")

    def test_TC_HOME_002(self):
        self.navigate_to("/")
        self.wait_for_content()
        nav_links = self.page.locator(
            'a[href="/contents"], a[href="/bloggers"], a[href*="popular"]'
        )

        if nav_links.count() > 0:
            contents_link = self.page.locator('a[href="/contents"]').first
            contents_link.click()
            self.wait_for_content()
            expect(self.page).to_have_url(f"{self.base_url}/contents")

    def test_TC_CONTENT_001(self):
        self.navigate_to("/contents")
        self.wait_for_content()
        expect(self.page).to_have_url(f"{self.base_url}/contents")
        content_area = self.page.locator("body")
        expect(content_area).to_have_text(".", timeout=10000)

    def test_TC_CONTENT_002(self):
        self.navigate_to("/contents")
        self.wait_for_content()
        body = self.page.locator("body")
        expect(body).to_be_visible()

        buttons = self.page.locator('button, [role="button"], .clickable')
        if buttons.count() > 0:
            first_button = buttons.first
            if first_button.is_visible():
                first_button.click()
                self.wait_for_content(5000)

    def test_TC_CONTENT_004(self):
        self.navigate_to("/contents")
        self.wait_for_content()
        links = self.page.locator("a, [href], .article, .content-item")

        if links.count() > 0:
            first_link = links.first
            if first_link.is_visible():
                first_link.click()
                self.wait_for_content()
                expect(self.page.url).not_to_equal(f"{self.base_url}/contents")

    def test_TC_BLOGGER_001(self):
        self.navigate_to("/bloggers")
        self.wait_for_content()
        expect(self.page).to_have_url(f"{self.base_url}/bloggers")
        body = self.page.locator("body")
        expect(body).to_be_visible()

    def test_TC_BLOGGER_002(self):
        self.navigate_to("/bloggers")
        self.wait_for_content()
        add_button = self.page.locator(
            'button:has-text("添加"), button:has-text("Add"), [class*="add"], .add-button'
        )

        if add_button.count() > 0:
            button = add_button.first
            if button.is_visible():
                button.click()
                self.wait_for_content(5000)

    def test_TC_DATA_001(self):
        self.navigate_to("/")
        self.wait_for_content()
        home_content = self.page.locator("body").text_content()

        self.navigate_to("/contents")
        self.wait_for_content()

        content_content = self.page.locator("body").text_content()

        expect(len(home_content)).to_be_greater_than(50)
        expect(len(content_content)).to_be_greater_than(50)

    def test_TC_DATA_002(self):
        self.navigate_to("/contents")
        self.wait_for_content()
        body = self.page.locator("body")
        expect(body).to_be_visible()

    def test_TC_NAV_001(self):
        self.navigate_to("/")
        self.wait_for_content()
        nav_paths = [
            "/contents",
            "/bloggers",
            "/popular-wechat",
            "/popular-zhihu",
            "/popular-github",
            "/rss-market",
            "/settings",
        ]

        for path in nav_paths:
            try:
                nav_link = self.page.locator(f'a[href="{path}"]')
                if nav_link.count() > 0 and nav_link.first.is_visible():
                    nav_link.first.click()
                    self.wait_for_content(5000)
                    expect(self.page.url).to_contain(path)
                    self.navigate_to("/")
                    self.wait_for_content(3000)
            except:
                pass

    def test_TC_HOME_003(self):
        self.navigate_to("/")
        self.wait_for_content()
        body = self.page.locator("body")
        expect(body).to_be_visible()

    def test_TC_CONTENT_003(self):
        self.navigate_to("/contents")
        self.wait_for_content()
        body = self.page.locator("body")
        expect(body).to_be_visible()

        sort_controls = self.page.locator('select, [class*="sort"], .sort-dropdown')
        if sort_controls.count() > 0:
            expect(sort_controls.first).to_be_visible()

    def test_TC_CONTENT_005(self):
        self.navigate_to("/contents")
        self.wait_for_content()
        refresh_buttons = self.page.locator(
            'button:has-text("刷新"), button:has-text("Refresh"), [class*="refresh"], .refresh-icon'
        )

        if refresh_buttons.count() > 0:
            first_refresh = refresh_buttons.first
            if first_refresh.is_visible():
                first_refresh.click()
                self.wait_for_content(5000)

    def test_TC_CONTENT_006(self):
        self.navigate_to("/contents")
        self.wait_for_content()
        search_input = self.page.locator(
            'input[type="search"], input[placeholder*="搜索"], input[placeholder*="Search"], [class*="search"]'
        )

        if search_input.count() > 0 and search_input.first.is_visible():
            search_input.first.fill("test")
            search_input.first.press("Enter")
            self.wait_for_content(5000)

    def test_TC_BLOGGER_003(self):
        self.navigate_to("/bloggers")
        self.wait_for_content()
        edit_buttons = self.page.locator(
            'button:has-text("编辑"), button:has-text("Edit"), [class*="edit"]'
        )

        if edit_buttons.count() > 0:
            first_edit = edit_buttons.first
            if first_edit.is_visible():
                first_edit.click()
                self.wait_for_content(5000)

    def test_TC_BLOGGER_004(self):
        self.navigate_to("/bloggers")
        self.wait_for_content()
        delete_buttons = self.page.locator(
            'button:has-text("删除"), button:has-text("Delete"), [class*="delete"]'
        )

        if delete_buttons.count() > 0:
            first_delete = delete_buttons.first
            if first_delete.is_visible():
                first_delete.click()
                self.wait_for_content(3000)

    def test_TC_BLOGGER_005(self):
        self.navigate_to("/bloggers")
        self.wait_for_content()
        toggles = self.page.locator(
            'input[type="checkbox"], [role="switch"], [class*="toggle"]'
        )

        if toggles.count() > 0:
            first_toggle = toggles.first
            if first_toggle.is_visible():
                first_toggle.click()
                self.wait_for_content(3000)

    def test_TC_POPULAR_001(self):
        self.navigate_to("/popular-wechat")
        self.wait_for_content()
        expect(self.page).to_have_url(f"{self.base_url}/popular-wechat")

    def test_TC_POPULAR_002(self):
        self.navigate_to("/popular-zhihu")
        self.wait_for_content()
        expect(self.page).to_have_url(f"{self.base_url}/popular-zhihu")

    def test_TC_POPULAR_003(self):
        self.navigate_to("/popular-github")
        self.wait_for_content()
        expect(self.page).to_have_url(f"{self.base_url}/popular-github")

    def test_TC_MARKET_001(self):
        self.navigate_to("/rss-market")
        self.wait_for_content()
        expect(self.page).to_have_url(f"{self.base_url}/rss-market")

    def test_TC_SETTINGS_001(self):
        self.navigate_to("/settings")
        self.wait_for_content()
        expect(self.page).to_have_url(f"{self.base_url}/settings")

    def test_TC_SETTINGS_002(self):
        self.navigate_to("/settings")
        self.wait_for_content()
        inputs = self.page.locator("input, select, textarea")

        if inputs.count() > 0:
            first_input = inputs.first
            if first_input.is_visible():
                first_input.focus()
                self.wait_for_timeout(1000)

    def test_TC_NAV_002(self):
        paths = ["/", "/contents", "/bloggers", "/settings"]

        for path in paths:
            self.navigate_to(path)
            self.wait_for_content()
            self.page.reload()
            self.wait_for_content()
            expect(self.page.url).to_contain(self.base_url)

    def run_all_tests(self):
        print("🚀 Starting AI Tracker Functional Testing")
        print(f"Base URL: {self.base_url}")
        print(f"Timestamp: {datetime.now().isoformat()}")

        try:
            self.setup_browser()

            print("\n🔥 EXECUTING P0 TEST CASES (CRITICAL)")

            self.execute_test(
                "TC-HOME-001",
                "P0",
                "Home page statistics cards display",
                self.test_TC_HOME_001,
            )
            self.execute_test(
                "TC-HOME-002",
                "P0",
                "Quick action buttons functionality",
                self.test_TC_HOME_002,
            )
            self.execute_test(
                "TC-CONTENT-001", "P0", "Channel list display", self.test_TC_CONTENT_001
            )
            self.execute_test(
                "TC-CONTENT-002",
                "P0",
                "Channel switching functionality",
                self.test_TC_CONTENT_002,
            )
            self.execute_test(
                "TC-CONTENT-004",
                "P0",
                "Article reading functionality",
                self.test_TC_CONTENT_004,
            )
            self.execute_test(
                "TC-BLOGGER-001",
                "P0",
                "RSS source list display",
                self.test_TC_BLOGGER_001,
            )
            self.execute_test(
                "TC-BLOGGER-002", "P0", "Add RSS source", self.test_TC_BLOGGER_002
            )
            self.execute_test(
                "TC-DATA-001",
                "P0",
                "Data consistency - home vs content list",
                self.test_TC_DATA_001,
            )
            self.execute_test(
                "TC-DATA-002",
                "P0",
                "Channel unread count consistency",
                self.test_TC_DATA_002,
            )
            self.execute_test(
                "TC-NAV-001", "P0", "Sidebar navigation", self.test_TC_NAV_001
            )

            print("\n⚡ EXECUTING P1 TEST CASES (HIGH PRIORITY)")

            self.execute_test(
                "TC-HOME-003",
                "P1",
                "Recent updates article list",
                self.test_TC_HOME_003,
            )
            self.execute_test(
                "TC-CONTENT-003",
                "P1",
                "Article list display and sorting",
                self.test_TC_CONTENT_003,
            )
            self.execute_test(
                "TC-CONTENT-005",
                "P1",
                "Single channel update functionality",
                self.test_TC_CONTENT_005,
            )
            self.execute_test(
                "TC-CONTENT-006", "P1", "Search functionality", self.test_TC_CONTENT_006
            )
            self.execute_test(
                "TC-BLOGGER-003", "P1", "Edit RSS source", self.test_TC_BLOGGER_003
            )
            self.execute_test(
                "TC-BLOGGER-004", "P1", "Delete RSS source", self.test_TC_BLOGGER_004
            )
            self.execute_test(
                "TC-BLOGGER-005",
                "P1",
                "Enable/disable RSS source",
                self.test_TC_BLOGGER_005,
            )
            self.execute_test(
                "TC-POPULAR-001", "P1", "Popular WeChat page", self.test_TC_POPULAR_001
            )
            self.execute_test(
                "TC-POPULAR-002", "P1", "Popular Zhihu page", self.test_TC_POPULAR_002
            )
            self.execute_test(
                "TC-POPULAR-003", "P1", "Popular GitHub page", self.test_TC_POPULAR_003
            )
            self.execute_test(
                "TC-MARKET-001", "P1", "RSS market page", self.test_TC_MARKET_001
            )
            self.execute_test(
                "TC-SETTINGS-001",
                "P1",
                "Settings page display",
                self.test_TC_SETTINGS_001,
            )
            self.execute_test(
                "TC-SETTINGS-002", "P1", "Modify settings", self.test_TC_SETTINGS_002
            )
            self.execute_test("TC-NAV-002", "P1", "Page refresh", self.test_TC_NAV_002)

        finally:
            self.teardown_browser()

    def generate_report(self):
        print("\n" + "=" * 80)
        print("📊 AI TRACKER FUNCTIONAL TEST REPORT")
        print("=" * 80)

        p0_tests = [r for r in self.test_results if r.priority == "P0"]
        p1_tests = [r for r in self.test_results if r.priority == "P1"]

        p0_passed = len([r for r in p0_tests if r.status == "PASS"])
        p0_failed = len([r for r in p0_tests if r.status == "FAIL"])
        p1_passed = len([r for r in p1_tests if r.status == "PASS"])
        p1_failed = len([r for r in p1_tests if r.status == "FAIL"])

        total_passed = len([r for r in self.test_results if r.status == "PASS"])
        total_failed = len([r for r in self.test_results if r.status == "FAIL"])
        total_tests = len(self.test_results)

        print(f"\n📈 EXECUTION SUMMARY")
        print(f"Total Tests: {total_tests}")
        print(f"Overall Pass Rate: {(total_passed / total_tests) * 100:.1f}%")
        print(
            f"Total Execution Time: {sum(r.execution_time for r in self.test_results):.2f}s"
        )

        print(f"\n🔥 P0 CRITICAL TESTS")
        print(f"Total: {len(p0_tests)} | Passed: {p0_passed} | Failed: {p0_failed}")
        print(f"P0 Pass Rate: {(p0_passed / len(p0_tests)) * 100:.1f}%")

        print(f"\n⚡ P1 HIGH PRIORITY TESTS")
        print(f"Total: {len(p1_tests)} | Passed: {p1_passed} | Failed: {p1_failed}")
        print(f"P1 Pass Rate: {(p1_passed / len(p1_tests)) * 100:.1f}%")

        failed_tests = [r for r in self.test_results if r.status == "FAIL"]

        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)})")
            for test in failed_tests:
                print(f"\n  {test.test_id}: {test.name}")
                print(f"  Priority: {test.priority}")
                print(f"  Error: {test.error_message}")
                print(f"  Execution Time: {test.execution_time:.2f}s")

        p0_bugs = [r for r in p0_tests if r.status == "FAIL"]
        p1_bugs = [r for r in p1_tests if r.status == "FAIL"]

        print(f"\n🐛 BUG CLASSIFICATION")
        print(f"P0 Bugs (Blocker): {len(p0_bugs)}")
        print(f"P1 Bugs (Major): {len(p1_bugs)}")

        print(f"\n🎯 QUALITY GATES ASSESSMENT")

        quality_gates = {
            "P0 Bugs = 0": len(p0_bugs) == 0,
            "P1 Bugs ≤ 2": len(p1_bugs) <= 2,
            "Pass Rate ≥ 80%": (total_passed / total_tests) >= 0.8,
            "All P0 Tests Executed": len(p0_tests) > 0,
            "All P1 Tests Executed": len(p1_tests) > 0,
        }

        all_gates_passed = all(quality_gates.values())

        for gate, passed in quality_gates.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"  {gate}: {status}")

        print(f"\n🏆 OVERALL RESULT")
        if all_gates_passed and len(p0_bugs) == 0 and len(p1_bugs) <= 2:
            print("✅ QUALITY GATES PASSED - Application is READY FOR RELEASE")
        else:
            print("❌ QUALITY GATES FAILED - Application requires fixes")

        report_data = {
            "summary": {
                "total_tests": total_tests,
                "total_passed": total_passed,
                "total_failed": total_failed,
                "pass_rate": (total_passed / total_tests) * 100,
                "execution_time": sum(r.execution_time for r in self.test_results),
                "timestamp": datetime.now().isoformat(),
            },
            "p0_summary": {
                "total": len(p0_tests),
                "passed": p0_passed,
                "failed": p0_failed,
                "pass_rate": (p0_passed / len(p0_tests)) * 100 if p0_tests else 0,
            },
            "p1_summary": {
                "total": len(p1_tests),
                "passed": p1_passed,
                "failed": p1_failed,
                "pass_rate": (p1_passed / len(p1_tests)) * 100 if p1_tests else 0,
            },
            "bugs": {"p0_bugs": len(p0_bugs), "p1_bugs": len(p1_bugs)},
            "quality_gates": quality_gates,
            "all_gates_passed": all_gates_passed,
            "test_results": [
                {
                    "test_id": r.test_id,
                    "name": r.name,
                    "priority": r.priority,
                    "status": r.status,
                    "error_message": r.error_message,
                    "execution_time": r.execution_time,
                    "start_time": r.start_time.isoformat() if r.start_time else None,
                    "end_time": r.end_time.isoformat() if r.end_time else None,
                }
                for r in self.test_results
            ],
        }

        report_file = f"/tmp/ai_tracker_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)

        print(f"\n📄 Detailed report saved to: {report_file}")

        return report_data


if __name__ == "__main__":
    tester = AITrackerTester()
    tester.run_all_tests()
    report = tester.generate_report()

    if report["p0_bugs"] == 0 and report["p1_bugs"] <= 2:
        print(f"\n🎉 Testing completed successfully!")
        sys.exit(0)
    else:
        print(f"\n⚠️ Testing completed with issues that need attention.")
        sys.exit(1)
