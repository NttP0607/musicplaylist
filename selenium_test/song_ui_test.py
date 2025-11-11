# File: selenium_test/song_ui_test.py

import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

ADMIN_URL = "http://localhost:5174/list-song"
STATIC_TEST_SONG_NAME = "test series"


class SongUITest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.maximize_window()
        self.driver.implicitly_wait(10)
        self.driver.get(ADMIN_URL)
        self.wait = WebDriverWait(self.driver, 15)

    def tearDown(self):
        self.driver.quit()

    # ----------------------------------------------------
    # TEST 01: TÌM KIẾM BÀI HÁT
    # ----------------------------------------------------
    def test_01_search_song_success(self):
        driver = self.driver
        wait = self.wait

        # Nhập tên bài hát vào thanh tìm kiếm
        search_input = driver.find_element(By.CSS_SELECTOR, 'input[placeholder="Tìm kiếm..."]')
        search_input.clear()
        search_input.send_keys(STATIC_TEST_SONG_NAME)
        time.sleep(1.5)

        # Kiểm tra bài hát xuất hiện trong danh sách
        try:
            song_row = wait.until(
                EC.presence_of_element_located((By.XPATH, f"//div[contains(@class, 'p-3') and .//*[contains(text(), '{STATIC_TEST_SONG_NAME}')]]"))
            )
            self.assertTrue(song_row.is_displayed(), f"Không thấy bài hát '{STATIC_TEST_SONG_NAME}' sau khi tìm kiếm.")
        except TimeoutException:
            self.fail(f"❌ Không tìm thấy bài hát '{STATIC_TEST_SONG_NAME}' sau khi tìm kiếm.")

        # Kiểm tra thông báo lỗi khi tìm không ra
        search_input.clear()
        search_input.send_keys("XYZ_NON_EXISTENT")
        time.sleep(1.5)
        error = driver.find_elements(By.XPATH, "//p[contains(text(), 'Không tìm thấy bài hát nào.')]")
        self.assertTrue(len(error) > 0, "Không hiển thị thông báo 'Không tìm thấy bài hát nào.'")

    # ----------------------------------------------------
    # TEST 02: XÓA BÀI HÁT
    # ----------------------------------------------------
    def test_02_remove_song_success(self):
        driver = self.driver
        wait = self.wait

        try:
            # 1️⃣ Tìm kiếm lại bài hát trước khi xóa
            search_input = driver.find_element(By.CSS_SELECTOR, 'input[placeholder="Tìm kiếm..."]')
            search_input.clear()
            search_input.send_keys(STATIC_TEST_SONG_NAME)
            time.sleep(1.5)

            # 2️⃣ Chờ bài hát xuất hiện
            row_locator = (By.XPATH, f"//div[contains(@class, 'p-3') and .//*[contains(text(), '{STATIC_TEST_SONG_NAME}')]]")
            song_row = wait.until(EC.presence_of_element_located(row_locator))

            # 🧩 Sửa ở đây
            delete_button = song_row.find_element(By.XPATH, ".//*[contains(normalize-space(text()), 'Xóa')]")
            delete_button.click()

            # 4️⃣ Xử lý confirm alert
            alert = wait.until(EC.alert_is_present())
            alert.accept()
            time.sleep(1)

            # 5️⃣ Chờ hàng biến mất
            wait.until(EC.invisibility_of_element_located(row_locator))

            # 6️⃣ Kiểm tra lại: không còn phần tử
            with self.assertRaises(NoSuchElementException):
                driver.find_element(*row_locator)

            print(f"✅ Đã xóa thành công bài hát: {STATIC_TEST_SONG_NAME}")

        except Exception as e:
            self.fail(f"❌ Test Xóa thất bại. Lỗi: {e}")



if __name__ == '__main__':
    unittest.main(verbosity=2)
