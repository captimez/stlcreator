import json
import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select



#Load Config File, created by STL-Creator 
with open("pythonConfig.json") as f:
    config = json.load(f)
    stl_file_path = f'{config["stlSavePath"]}/{config["selectedFile"]}'
    filename = config["selectedFile"].split(".")[0]
    objectType = config["type"][0]
    solution_name = config["solutionName"]
    workpiece_aussendurchmesser = config['aussendurchmesser']
    workpiece_innendurchmesser = config['innendurchmesser']
    workpiece_hoehe = config['hoehe']

workpiece_innenradius = workpiece_innendurchmesser / 2
workpiece_aussenradius = workpiece_aussendurchmesser / 2

gp = {
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
photoneo_ip = "http://192.168.2.1" 

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

#Change CAD FILE of existing workpiece
driver.get(f"{photoneo_ip}/solution/{solution_id}/object/")
try:
    object_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/solution/"][href*="/object/"][href$="/edit/"]')

    href = object_links[0].get_attribute("href")
    print(href)
    driver.get(f'{href}')
    
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
except:
    print("Kein Objekt zum Löschen gefunden.")

time.sleep(2)
#Navigate to Gripping Points
driver.get(f"{photoneo_ip}/solution/{solution_id}/gripping_points/")
#workpiece_select = driver.find_element(By.NAME,"picking_object")

gripping_point_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="solution/"][href*="/gripping_points/"]')
gripping_point_hrefs = [link.get_attribute("href") for link in gripping_point_links]
print(f'{len(gripping_point_links)} Gripping Points found.')
gp_count = 0
for href in gripping_point_hrefs:
    print(href)
    driver.get(f'{href}')

    #Adjust Gripping Point
    input_gripping_point_x = driver.find_element(By.NAME,"position_x")
    input_gripping_point_x.clear()

    if(gp_count == 0):
        input_gripping_point_x.send_keys(gp["x"])
    
    if(gp_count == 1):
        input_gripping_point_x.send_keys(-gp["x"])

    time.sleep(2)

    #Set Rotation Invariant if object is ring type
    if(objectType == "Ring"):
        checkbox = driver.find_element(By.NAME, "is_rot_inv_enabled")

        if not checkbox.is_selected():
            driver.execute_script("arguments[0].click();", checkbox)

    #Save Gripping Point
    save_gripping_point_button = driver.find_element(By.ID, "save-grasping-steps")
    save_gripping_point_button.click()

    gp_count += 1
    time.sleep(1)

#QUIT FOR NOW
driver.quit()

# STEP 5: Go to Vision System
driver.get(f"{photoneo_ip}/solution/{solution_id}/vision/")

# STEP 6: Get all Box Localization links
box_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/vision/"][href$="/edit/"]')
box_hrefs = [link.get_attribute("href") for link in box_links]

for href in box_hrefs:
    localization_path = href.replace("/edit", "/localization/")
    driver.get(localization_path)

    # STEP 7.1: Edit Current
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "id-loca-start-edit"))).click()

    # STEP 7.2: Wait for UI to settle (optional)
    time.sleep(1)  # Or wait for some canvas or element if available

    # STEP 7.3: Scan & Locate
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "id-scan-and-locate"))).click()

    # STEP 7.4: Wait for scan to complete (optional but recommended)
    time.sleep(2)

    # STEP 7.5: Save configuration
    save_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "id-save-localization_profile"))
    )
    driver.execute_script("arguments[0].removeAttribute('disabled')", save_button)
    save_button.click()

    # STEP 7.6: Quit localization
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "id-exit-localization"))).click()

    # STEP 7.7: Read notification
    try:
        msg = WebDriverWait(driver, 5).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, 'span[data-notify="message"]'))
        ).text
        print("Message:", msg)
    except:
        print("No message found.")

# STEP 8: Deployment    
driver.find_element(By.ID, "deploy-btn").click()


# STEP 9: Ensure "Production Mode" is checked
checkbox = driver.find_element(By.NAME, "mode")
is_production = checkbox.get_attribute("checked")  # will be 'true' or None

if not is_production:
    driver.execute_script("arguments[0].click();", checkbox)

# STEP 10: Click Proceed
#WebDriverWait(driver, 10).until(
    #EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[name="deployment-action"][value="start-solution-list"]'))
#).click()
#TODO
#PRE SELECTED BAUTEIL IN SOLUTION
#1. CHANGE CAD MODEL OF BAUTEIL
#2. CHANGE THUMBNAIL
#3. ADJUST EXISTING GRIPPING POINT COORDINATES
#4. AJUDST ROTATION INVARIANCE

#5.GO TO VISION SYSTEM
#6. GET ALL IDS OF BOXes
#7. ITERATE BOX
    #1.LOCALIZATION <a href="/solution/37/vision/103/localization/">Localization</a>
    #2. EDIT CURRETN <button type="submit" class="btn btn-default loca-button" name="localization-action" id="id-loca-start-edit" value="start-edit"> <i class="fa fa-edit"></i> Edit current
    #</button>
    #3. WAIT FOR LOAD ANYHOW
    #4. SCAN AND LOCATE <button type="button" id="id-scan-and-locate" class="btn btn-primary disable-on-stop" name="env">
                        #   <i class="fa fa-camera"></i> Scan &amp; Locate
                        #</button>
    #5. SAVE CONFIGURATION BUTTON : <button type="button" id="id-save-localization_profile" class="btn btn-primary disable-on-stop push-to-right hint-trigger hint-short" name="env" disabled="">
                                    #   <i class="fa fa-save"></i> Save configuration
                                    #</button>
    #6. QUIT LOCALIZATION <button type="button" id="id-exit-localization" class="btn btn-danger" name="env" style="top: -10px">
                        #   <i class="fa fa-times"></i> Quit localization
                        #</button>
    #7. Read <span data-notify="message">hier ist die message</span>

#8.  DEPLOY Button id="deploy-btn"
#9. Popup input <input type="checkbox" checked="" name="mode" data-toggle="toggle" data-width="180" class="binpicking-mode" data-onstyle="danger" data-on="Production mode" data-off="Simulation mode" disabled="">
# CHECKED = Produciton mode
# UNCHECKED = Simulation mode, always needs to be Productin MODE
#10. PROCEED BUTTON <button type="submit" class="btn btn-primary btn-class-deployment-action-confirm-start prevent-multiple-clicks" name="deployment-action" value="start-solution-list">
                 #   Proceed
                #</button>
# FINISHED