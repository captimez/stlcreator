import json
import time
import re
import os
from opcua import Client
from opcua import ua
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException

PLC_IP = "192.168.1.5"
client = Client(f"opc.tcp://{PLC_IP}:4840")


# Function to send progress updates
def send_progress(percentage, message):
    progress_data = {
        "percentage": percentage,
        "message": message
    }
    print(json.dumps(progress_data))  # Send JSON data to the console or UI

def send_to_sps(value):
    try:
        client.connect()

        node = client.get_node('ns=3, s="Typdaten_DB".innendurchmesser')
        node.set_value(ua.Variant(value,ua.VariantType.UInt))
    finally:
        client.disconnect()

def update_thumbnail(driver):
    for toggle in all_toggles:
        if "Thumbnail" in toggle.text:
            toggle.click()
            break

    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "take-thumbnail"))
    ).click()   

# Load Config File, created by STL-Creator 
try:
    with open("pythonConfig.json") as f:
        config = json.load(f)
        stl_file_path = f'{config["stlSavePath"]}/{config["selectedFile"]}'
        filename = config["selectedFile"].split(".")[0]
        objectType = config["type"][0]
        solution_name = config["solutionName"]
        workpiece_aussendurchmesser = config['aussendurchmesser']
        workpiece_innendurchmesser = config['innendurchmesser']
        workpiece_hoehe = config['hoehe']
        workpiece_thoehe = config['thoehe']
        workpiece_laenge = config['laenge']
        workpiece_verschiebung = config['verschiebung']

    send_to_sps(workpiece_innendurchmesser)
    send_progress(5, "Loaded configuration file successfully.")
except Exception as e:
    send_progress(0, f"Error loading config file: {e}")
    exit(1)

workpiece_innenradius = workpiece_innendurchmesser / 2
workpiece_aussenradius = workpiece_aussendurchmesser / 2

grip_depth = 17.5
grip_tolerance = 4
max_grip_depth = grip_depth - grip_tolerance 

if(objectType == "Ring"):
    gp = {
        "x": workpiece_innenradius + ((workpiece_aussenradius - workpiece_innenradius) / 2),
        "y": 0, 
        "z": ((workpiece_hoehe / 2) - max_grip_depth), 
        "rx": 0, 
        "ry": 0, 
        "rz": 0,
    }
elif(objectType == "TStueck"):
    gp = {
        "x": 0,
        "y": workpiece_thoehe / 2, 
        "z": 0,
        "rx": 180, 
        "ry": 0, 
        "rz": 0,
    }
elif(objectType == "Winkel"):
    gp = {
        "x": 0, 
        "y": workpiece_laenge / 2, 
        "z": 0, 
        "rx": 0, 
        "ry": 0, 
        "rz": 0,
    }


#Photoneo BPS IP
#photoneo_ip = "http://192.168.2.1" 
photoneo_ip = "http://127.0.0.1"  # Localhost for testing
def get_default_chrome_options():
    options = webdriver.ChromeOptions()
    #options.add_argument("--headless=new")  # Verwende den neuen Headless-Modus
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    return options

try:
    # Initialize WebDriver
    base = os.path.dirname(os.path.abspath(__file__))
    chromedriver_path = os.path.join(base, 'chromedriver')
    service = Service(exectuable_path= chromedriver_path)
    
    options = get_default_chrome_options()
    options.page_load_strategy = 'eager'
    driver = webdriver.Chrome(service=service, options=options)
    #driver = webdriver.Edge()
    driver.implicitly_wait(10)
    send_to_sps(workpiece_innendurchmesser)
    send_progress(10, "Initialized WebDriver successfully.")
except Exception as e:
    send_progress(0, f"Error initializing WebDriver: {e}")
    exit(1)

try:
    # Login to Photoneo BPS
    driver.get(f"{photoneo_ip}/solutions/")
    driver.find_element(By.ID, "id_username").send_keys("rbc@rbc-robotics.de")
    driver.find_element(By.ID, "id_password").send_keys("rbc001rbc001rbc001")
    driver.find_element(By.ID, "login_button").click()
    time.sleep(2)
    send_progress(20, "Logged into Photoneo BPS successfully.")
except Exception as e:
    send_progress(0, f"Error logging into Photoneo BPS: {e}")
    driver.quit()
    exit(1)

try:
    driver.get(f"{photoneo_ip}/deployment")
    stop_button = driver.find_element(By.ID, "btn-deployment-action-stop")
    driver.execute_script("arguments[0].scrollIntoView();", stop_button)
    stop_button.click()
    send_progress(25, "Stopped deployment successfully.")
    driver.get(f"{photoneo_ip}/solutions/")
except NoSuchElementException:
    send_progress(25, "No Deployment, continuing...")

try:
    # Get all existing Solution IDs
    links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="solution/"][href$="/detail/"]')
    solution_ids = []
    for link in links:
        href = link.get_attribute("href")
        match = re.search(r'solution/(\d+)/detail', href)
        if match:
            solution_ids.append(int(match.group(1)))
    if not solution_ids:
        raise ValueError("No solutions found.")
    
    if objectType == "Ring":
        template_id = solution_ids[0]
    elif objectType == "TStueck":
        template_id = solution_ids[1]
    elif objectType == "Winkel":
        template_id = solution_ids[2]
    

    send_progress(30, "Retrieved all existing solution IDs.")
except Exception as e:
    send_progress(0, f"Error retrieving solution IDs: {e}")
    driver.quit()
    exit(1)

try:
    # Duplicate Template Solution
    driver.get(f'{photoneo_ip}/solution/{template_id}/duplicate')
    time.sleep(1)
    name_input = driver.find_element(By.ID, "id_name")
    name_input.clear()
    name_input.send_keys(solution_name)
    duplicate_button = driver.find_element(By.ID, "duplicate-solution-btn")
    duplicate_button.click()
    send_progress(40, "Duplicated template solution successfully.")
except Exception as e:
    send_progress(0, f"Error duplicating template solution: {e}")
    driver.quit()
    exit(1)

try:
    # Retrieve the new Solution ID
    link = driver.find_element(By.XPATH, f"//a[contains(text(), '{solution_name}')]")
    href = link.get_attribute("href")
    solution_id = href.split("/")[4]
    time.sleep(0.5)
    link.click()
    time.sleep(2)
    send_progress(50, "Retrieved new solution ID successfully.")
except Exception as e:
    send_progress(0, f"Error retrieving new solution ID: {e}")
    driver.quit()
    exit(1)

try:
    # Change CAD File of Existing Workpiece
    driver.get(f"{photoneo_ip}/solution/{solution_id}/object/")
    object_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/solution/"][href*="/object/"][href$="/edit/"]')
    href = object_links[0].get_attribute("href")
    driver.get(f'{href}')
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "id_name")))
    name_input = driver.find_element(By.ID, "id_name")
    name_input.clear()
    
    # Alle span.widget-title Elemente holen
    all_toggles = driver.find_elements(By.CSS_SELECTOR, "span.widget-title")

    # Durchgehen und das mit "Thumbnail" im Textinhalt finden
    update_thumbnail(driver)
    send_progress(55, "Updated Thumbnail successfully.")
    name_input.send_keys("" + filename)
    file_input = driver.find_element(By.ID, "id-mesh")
    driver.execute_script("arguments[0].style.display = 'block';", file_input)
    file_input.send_keys(stl_file_path)
    send_progress(60, "Changed CAD file of existing workpiece successfully.")
except Exception as e:
    send_progress(0, f"Error changing CAD file: {e}")
    driver.quit()
    exit(1)

try:
    # Save Workpiece
    save_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    time.sleep(2)
    save_button.click()
    time.sleep(2)
    send_progress(70, "Saved workpiece successfully.")
except Exception as e:
    send_progress(0, f"Error saving workpiece: {e}")
    driver.quit()
    exit(1)

try:
    # Navigate to Gripping Points
    driver.get(f"{photoneo_ip}/solution/{solution_id}/gripping_points/")
    gripping_point_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="solution/"][href*="/gripping_points/"]')
    gripping_point_hrefs = [link.get_attribute("href") for link in gripping_point_links]
    gp_count = 0
    for href in gripping_point_hrefs:

        if(objectType == "Ring"):
            driver.get(f'{href}')
            
            # Adjust Gripping Point
            input_gripping_point_x = driver.find_element(By.NAME,"position_x")
            input_gripping_point_x.clear()

            input_gripping_point_z = driver.find_element(By.NAME,"position_z")
            input_gripping_rot_x = driver.find_element(By.NAME,"rotation_x")
            input_gripping_rot_y = driver.find_element(By.NAME,"rotation_y")
            rotation_x_value = input_gripping_rot_x.get_attribute("value")
        
            #Gripping Point Position X
            if(gp_count < 6):
                input_gripping_point_x.send_keys(gp["x"])
            else:
                input_gripping_point_x.send_keys(-gp["x"])	

            if gp_count == 0:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(0)
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(0)
            elif gp_count == 1:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(180)
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(0)
            elif gp_count == 2:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(0)
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(15)
            elif gp_count == 3:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(180)
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(15)
            elif gp_count == 4:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(0)
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(-15)
            elif gp_count == 5:
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(-15)
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(180)
            elif gp_count == 6:
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(0)
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(0)
            elif gp_count == 7:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(180)
            elif gp_count == 8:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(0)
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(15)
            elif gp_count == 9:
                input_gripping_rot_x.clear()
                input_gripping_rot_y.clear()
                input_gripping_rot_x.send_keys(180)
                input_gripping_rot_y.send_keys(15)
            elif gp_count == 10:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(0)
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(-5)
            elif gp_count == 11:
                input_gripping_rot_x.clear()
                input_gripping_rot_x.send_keys(0)
                input_gripping_rot_y.clear()
                input_gripping_rot_y.send_keys(15)
            # Gripping Point Position Z
            input_gripping_point_z.clear()

            #Gripping Point x,y rotation Adjustment
            if((workpiece_hoehe/2) > max_grip_depth):
                if(float(rotation_x_value) == 180):
                    input_gripping_point_z.send_keys(gp["z"])
                else:
                    input_gripping_point_z.send_keys(-gp["z"])
            else:
                input_gripping_point_z.send_keys(0)
            

            checkbox = driver.find_element(By.NAME, "is_rot_inv_enabled")

            if not checkbox.is_selected():
                driver.execute_script("arguments[0].click();", checkbox)
	
        elif(objectType == "TStueck"):
            if(gp_count == 0):
                driver.get(f'{href}')
            else:
                href.replace("edit", "delete")
                driver.get(f'{href}')
                delete_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "delete-grasping-point"))
                )
                driver.execute_script("arguments[0].scrollIntoView();", delete_button)
            
            input_rotation_x = driver.find_element(By.NAME,"rotation_x")
            input_rotation_x.clear()
            input_rotation_x.send_keys(gp["rx"])

            input_gripping_point_y = driver.find_element(By.NAME,"position_y")
            input_gripping_point_y.clear()
            input_gripping_point_y.send_keys(gp["y"])
        
            checkbox = driver.find_element(By.NAME, "is_rot_inv_enabled")

            if checkbox.is_selected():
                driver.execute_script("arguments[0].click();", checkbox)

        elif(objectType == "Winkel"):
            if(gp_count == 0):
                driver.get(f'{href}')

                input_gripping_point_x = driver.find_element(By.NAME,"position_x")
                input_gripping_point_x.clear()
                input_gripping_point_x.send_keys(0)
                input_gripping_point_y = driver.find_element(By.NAME,"position_y")
                input_gripping_point_y.clear()
                input_gripping_point_y.send_keys(gp["y"])

                checkbox = driver.find_element(By.NAME, "is_rot_inv_enabled")

                if not checkbox.is_selected():
                    driver.execute_script("arguments[0].click();", checkbox)
                rot_y_checkbox = driver.find_element(By.ID, "id_rot_inv_axis_choice_2")

            elif(gp_count == 1):
                driver.get(f'{href}')
                input_gripping_point_y.clear()
                input_gripping_point_y.send_keys(workpiece_verschiebung["y"])

                input_gripping_point_x = driver.find_element(By.NAME,"position_x")
                input_gripping_point_x.clear()
                input_gripping_point_x.send_keys(workpiece_verschiebung["z"])

                input_rotation_z = driver.find_element(By.NAME,"rotation_z")
                input_rotation_z.clear()
                input_rotation_z.send_keys(-workpiece_verschiebung["w"])
            elif(gp_count > 1):
                driver.get(f"{photoneo_ip}/solution/{solution_id}/gripping_points/")  

        time.sleep(2)

        # Set Rotation Invariant if object is ring type
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

        # Save Gripping Point
        save_gripping_point_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "save-grasping-steps"))
        )

        driver.execute_script("arguments[0].scrollIntoView();", save_gripping_point_button)
        save_gripping_point_button.click()
        send_progress(70 + gp_count, "Adjusting Gripping Points")
        gp_count += 1
        time.sleep(1)
    send_progress(80, "Adjusted gripping points successfully.")
except Exception as e:
    send_progress(0, f"Error navigating to or adjusting gripping points: {e}")
    driver.quit()
    exit(1)

try:
    # STEP 5: Go to Vision System
    driver.get(f"{photoneo_ip}/solution/{solution_id}/vision/")
    send_progress(85, "Navigated to Vision System successfully.")
except Exception as e:
    send_progress(0, f"Error navigating to Vision System: {e}")
    driver.quit()
    exit(1)

try:
    # STEP 6: Get all Box Localization links
    box_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/vision/"][href$="/edit/"]')
    box_hrefs = [link.get_attribute("href") for link in box_links]

    for href in box_hrefs:
        driver.get(href)
        time.sleep(1)

        # Find the Select Element
        select_element = driver.find_element(By.ID, "id_picking_object")

        # Create a Select Object
        select = Select(select_element)

        # Select by visible text
        select.select_by_visible_text(filename)
        time.sleep(1)

        save_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        save_button.click()
        time.sleep(2)

        localization_path = href.replace("/edit/", "/localization/")
        driver.get(localization_path)

        # STEP 7.1: Edit Current
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "id-loca-start-edit"))).click()

        # STEP 7.2: Wait for UI to settle (optional)
        time.sleep(1)
        select_element = driver.find_element(By.CSS_SELECTOR, "select.select.form-control")
        select = Select(select_element)
        
        select.select_by_visible_text(f"Picked object ({filename})")
        time.sleep(2)

        # STEP 7.3: Scan & Locate
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "id-scan-and-locate"))).click()

        # STEP 7.4: Wait for scan to complete
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
            send_progress(85, msg)
        except:
            send_progress(85, "No notification found.")
        driver.get(f"{photoneo_ip}/solution/{solution_id}/vision/")
    send_progress(90, "Box localization and configuration completed successfully.")
except Exception as e:
    send_progress(0, f"Error during box localization or configuration: {e}")
    driver.quit()
    exit(1)

try:
    # STEP 8: Deployment
    driver.find_element(By.ID, "deploy-btn").click()
    send_progress(95, "Deployment initiated successfully.")
except Exception as e:
    send_progress(0, f"Error initiating deployment: {e}")
    driver.quit()
    exit(1)

try:
    # STEP 9: Ensure "Production Mode" is checked
    checkbox = driver.find_element(By.NAME, "mode")
    is_production = checkbox.get_attribute("checked")  # will be 'true' or None

    if not is_production:
        driver.execute_script("arguments[0].click();", checkbox)

    # STEP 10: Click Proceed
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'button[name="deployment-action"][value="start-solution-list"]'))
    ).click()
    send_progress(100, "Solution deployed successfully. Process completed.")
except Exception as e:
    send_progress(0, f"Error during deployment or finalization: {e}")
    driver.quit()
    exit(1)

# Final cleanup
driver.quit()
