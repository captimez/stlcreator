import json
import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC



#Load Config File, created by STL-Creator 
with open("pythonConfig.json") as f:
    config = json.load(f)
    stl_file_path = f'output/{config["selectedFile"]}'
    filename = config["selectedFile"].split(".")[0]
    objectType = config["type"]
    solution_name = config["solutionName"]
    workpiece_aussendurchmesser = config['aussendurchmesser']
    workpiece_innendurchmesser = config['innendurchmesser']
    workpiece_hoehe = config['hoehe']

workpiece_innenradius = workpiece_innendurchmesser / 2
workpiece_aussenradius = workpiece_aussendurchmesser / 2

gripping_point = {
    "x": workpiece_innenradius + ((workpiece_aussenradius - workpiece_innenradius) / 2),
    "y": 0, 
    "z": 0, 
    "rx": 0, 
    "ry": 0, 
    "rz": 0,
}

print(stl_file_path)
print(objectType)
print(solution_name)

#Photoneo BPS IP
photoneo_ip = "http://192.168.1.1" 

def get_default_chrome_options():
    options = webdriver.ChromeOptions()
    options.add_argument("--no-sandbox")
    return options

options = get_default_chrome_options()
options.page_load_strategy = 'eager'
#driver = webdriver.Edge()
driver = webdriver.Chrome(options=options)

driver.implicitly_wait(5)

#Login to Photoneo BPS 
driver.get(f"{photoneo_ip}/solutions/")

driver.find_element(By.ID, "id_username").send_keys("rbc@rbc-robotics.de")
driver.find_element(By.ID, "id_password").send_keys("rbc001rbc001rbc001")
driver.find_element(By.ID, "login_button").click()
time.sleep(2)

#Get all existing Solutions IDS
links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="solution/"][href$="/detail/"]')

solution_ids = []
for link in links:
    href = link.get_attribute("href")
    match = re.search(r'solution/(\d+)/detail', href)
    if match:
        solution_ids.append(int(match.group(1)))

print(solution_ids)

#Min ID of Solutions = Templated Solution ID
if solution_ids:
    template_id = min(solution_ids)
    ##next_id_guess = max(solution_ids) + 1
else:
    print("Keine Solutions gefunden.")
    driver.quit()
    exit(1)


#Duplicate Template Solution
driver.get(f'{photoneo_ip}/solution/{template_id}/duplicate')
time.sleep(1)


name_input = driver.find_element(By.ID, "id_name")
name_input.clear()
name_input.send_keys(solution_name)


#uid_input = driver.find_element(By.ID, "id_uid")
#uid_input.clear()
#uid_input.send_keys(solution_id)

duplicate_button = driver.find_element(By.ID, "duplicate-solution-btn")
duplicate_button.click()

#Retrieve the new Solution ID
link = driver.find_element(By.XPATH, f"//a[contains(text(), '{solution_name}')]")
href = link.get_attribute("href")
solution_id = href.split("/")[4]

time.sleep(0.5)
link.click()

time.sleep(2)

#Delete old Workpiece if existing
driver.get(f"{photoneo_ip}/solution/{solution_id}/object/")
try:
    delete_object_button = driver.find_element(By.NAME, "delete")
    delete_object_button.click()

    modal_proceed = driver.find_element(By.ID, "confirm-modal-proceed")
    modal_proceed.click()
    time.sleep(2)
except:
    print("Kein Objekt zum Löschen gefunden.")

#Add new Workpiece
driver.get(f"{photoneo_ip}/solution/{solution_id}/object/add")
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "id_name")))

name_input = driver.find_element(By.ID, "id_name")
name_input.send_keys("" + filename)

file_input = driver.find_element(By.ID, "id-mesh")

# Falls das Input-Feld versteckt ist, per JS sichtbar machen
driver.execute_script("arguments[0].style.display = 'block';", file_input)
file_input.send_keys(stl_file_path)

#Save Workpiece 
save_button = driver.find_element(By.XPATH, "//button[@type='submit']")
save_button.click()
time.sleep(3)

#Navigate to Gripping Points
driver.get(f"{photoneo_ip}/solutions/{solution_id}/gripping_points/")
workpiece_select = driver.find_element(By.NAME,"picking_object")
workpiece_select.send_keys(filename)
workpiece_select.click()

add_gripping_point_button = driver.find_element(By.ID, "btn-gp-action-new")

#Adjust Gripping Point
input_gripping_point_x = driver.find_element(By.NAME,"position_x")
input_gripping_point_x.clear()
input_gripping_point_x.send_keys(gripping_point["x"])

#Set Rotation Invariant if object is ring type
if(objectType == "ring"):
    rot_invariatn_checkbox = driver.find_element(By.NAME, "is_rot_inv_enabled")
    rot_invariatn_checkbox.click()

#Save Gripping Point
save_gripping_point_button = driver.find_element(By.ID, "save-grasping-steps")
save_gripping_point_button.click()
time.sleep(1)

driver.get(f"{photoneo_ip}/solutions/{solution_id}/gripping_points/")

#Create 2. Gripping Point
workpiece_select = driver.find_element(By.NAME,"picking_object")
workpiece_select.send_keys(filename)
workpiece_select.click()

add_gripping_point_button = driver.find_element(By.ID, "btn-gp-action-new")

#Adjust Gripping Point in negative direction
input_gripping_point_x = driver.find_element(By.NAME,"position_x")
input_gripping_point_x.clear()
input_gripping_point_x.send_keys(-gripping_point["x"])

#Set Rotation Invariant if object is ring type
if(objectType == "ring"):
    rot_invariatn_checkbox = driver.find_element(By.NAME, "is_rot_inv_enabled")
    rot_invariatn_checkbox.click()

save_gripping_point_button = driver.find_element(By.ID, "save-grasping-steps")
save_gripping_point_button.click()
time.sleep(1)

# Browser schließen
driver.quit()
