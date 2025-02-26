import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

with open("config.json") as f:
    config = json.load(f)
    stl_file_path = f'output/{config["selectedFile"]}'
    objectType = config["type"]
    solution_name = config["solutionName"]

print(stl_file_path)
print(objectType)
print(solution_name)
# Dynamische Variablen für die Solution-ID und die IP-Adresse
solution_id = "201"  # Hier die gewünschte ID eintragen
photoneo_ip = "http://192.168.1.1" # Falls das auf einem anderen Gerät läuft, z. B. "http://192.168.1.100"



def get_default_chrome_options():
    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    return options

options = get_default_chrome_options()
options.page_load_strategy = 'eager'
driver = webdriver.Edge()

driver.implicitly_wait(5)

# 1. Erstelle neue Solution
driver.get(f"{photoneo_ip}/solutions/")

driver.find_element(By.ID, "id_username").send_keys("rbc@rbc-robotics.de")
driver.find_element(By.ID, "id_password").send_keys("rbc001rbc001rbc001")
driver.find_element(By.ID, "login_button").click()
time.sleep(2)

#

driver.get(f'{photoneo_ip}/solution/18/duplicate')
time.sleep(1)
name_input = driver.find_element(By.ID, "id_name")
name_input.clear()
name_input.send_keys(solution_name)
uid_input = driver.find_element(By.ID, "id_uid")
uid_input.clear()
uid_input.send_keys(solution_id)

duplicate_button = driver.find_element(By.ID, "duplicate-solution-btn")
duplicate_button.click()

link = driver.find_element(By.XPATH, f"//a[contains(text(), '{solution_name}')]")
href = link.get_attribute("href")
solution_id = href.split("/")[4]
print(href)
print(solution_id)
time.sleep(0.5)
link.click()

time.sleep(2)

# 2. Lösche altes Objekt aus der Solution (falls vorhanden)
driver.get(f"{photoneo_ip}/solution/{solution_id}/object/")
try:
    delete_object_button = driver.find_element(By.NAME, "delete")
    delete_object_button.click()

    modal_proceed = driver.find_element(By.ID, "confirm-modal-proceed")
    modal_proceed.click()
    time.sleep(2)
except:
    print("Kein Objekt zum Löschen gefunden.")

# 3. Neues Objekt zur Solution hinzufügen
driver.get(f"{photoneo_ip}/solution/{solution_id}/object/add")
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "id_name")))

name_input = driver.find_element(By.ID, "id_name")
name_input.send_keys("Applied Name")

file_input = driver.find_element(By.ID, "id-mesh")

# Falls das Input-Feld versteckt ist, per JS sichtbar machen
driver.execute_script("arguments[0].style.display = 'block';", file_input)
file_input.send_keys(stl_file_path)

# Speichern
save_button = driver.find_element(By.XPATH, "//button[@type='submit']")
save_button.click()
time.sleep(3)

# 4. Gehe zu den Gripping Points
driver.get(f"{photoneo_ip}/solutions/{solution_id}/gripping_points/")

# Browser schließen
driver.quit()
