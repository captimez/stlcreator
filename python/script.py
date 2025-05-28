import json
import time
import re
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException



# Function to send progress updates
def send_progress(percentage, message):
    progress_data = {
        "percentage": percentage,
        "message": message
    }
    print(json.dumps(progress_data))  # Send JSON data to the console or UI


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
        copySolutionId = config["copySolutionId"]

        if(objectType == "Rohr"):
            workpiece_rohrlaenge = config['rohrlaenge']
        elif(objectType == "LStueck"):
            workpiece_laenge = config['laenge']
            workpiece_radius = config['radius']
            workpiece_laenge = workpiece_laenge - (workpiece_radius * 2)
            workpiece_verschiebung = config['verschiebung']
        elif(objectType == "TStueck"):
            workpiece_thoehe = config['thoehe']
        elif(objectType == "Ring"):
            workpiece_aussendurchmesser = config['aussendurchmesser']
            workpiece_innendurchmesser = config['innendurchmesser']
            workpiece_hoehe = config['hoehe']
            
            workpiece_innenradius = workpiece_innendurchmesser / 2
            workpiece_aussenradius = workpiece_aussendurchmesser / 2

    send_progress(5, "Loaded configuration file successfully.")
except Exception as e:
    send_progress(0, f"Error loading config file: {e}")
    exit(1)


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
        "rx": 90, 
        "ry": 90, 
        "rz": 0,
    }
elif(objectType == "Rohr"):
    gp = {
        "x": 0, 
        "y": workpiece_rohrlaenge / 2, 
        "z": 0, 
        "rx": 0, 
        "ry": 0, 
        "rz": 0,
    }
elif(objectType == "LStueck"):
    gp = {
        "x": workpiece_laenge + workpiece_radius + (workpiece_radius / 2), 
        "y": -(workpiece_radius / 2), 
        "z": 0, 
        "rx": 0, 
        "ry": 0, 
        "rz": 0,
    }


#Photoneo BPS IP
photoneo_ip = "http://192.168.2.1" 
#photoneo_ip = "http://127.0.0.1"  # Localhost for testing
def get_default_chrome_options():
    options = webdriver.ChromeOptions()
    #options.add_argument("--headless=new")  # Verwende den neuen Headless-Modus
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    return options

try:
    # Initialize WebDriver
    base = os.path.dirname(os.path.abspath(__file__))
    chromedriver_path = os.path.join(base, 'chromedriver/chromedriver.exe')
    service = Service(executable_path= chromedriver_path)
    
    options = get_default_chrome_options()
    options.page_load_strategy = 'eager'
    #driver = webdriver.Chrome(service=service, options=options)
    driver = webdriver.Edge()
    driver.set_window_size(1920, 1080)
    driver.implicitly_wait(10)
    #send_to_sps(workpiece_innendurchmesser)
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
    time.sleep(1)
    send_progress(20, "Logged into Photoneo BPS successfully.")
except Exception as e:
    send_progress(0, f"Error logging into Photoneo BPS: {e}")
    driver.quit()
    exit(1)

try:
    driver.get(f"{photoneo_ip}/deployment")
    try:
        stop_button = WebDriverWait(driver, 2).until(
            EC.presence_of_element_located((By.ID, "btn-deployment-action-stop"))
        )
        driver.execute_script("arguments[0].scrollIntoView();", stop_button)
        stop_button.click()
        send_progress(25, "Stopped deployment successfully.")
    except Exception:
        send_progress(25, "No Deployment, continuing...")
    driver.get(f"{photoneo_ip}/solutions/")
except Exception as e:
    send_progress(0, f"Error during deployment stop check: {e}")
    driver.quit()
    exit(1)

try:
    # Get all existing Solution IDs
    links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="solution/"][href$="/detail/"]')
    solution_ids = []
    for link in links:
        href = link.get_attribute("href")
        match = re.search(r'solution/(\d+)/detail', href)
        if match:
            solution_ids.append(int(match.group(1)))
    
    solution_ids.sort()
    send_progress(25, str(solution_ids))
    if not solution_ids:
        raise ValueError("No solutions found.")
      # Sort in descending order
    else:
        template_id = copySolutionId
    

    send_progress(30, "Retrieved all existing solution IDs.")
except Exception as e:
    send_progress(0, f"Error retrieving solution IDs: {e}")
    driver.quit()
    exit(1)

try:
    # Duplicate Template Solution
    driver.get(f'{photoneo_ip}/solution/{template_id}/duplicate')
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "id_name")))
    name_input = driver.find_element(By.ID, "id_name")
    name_input.clear()
    name_input.send_keys(solution_name)

    uid_input = driver.find_element(By.ID, "id_uid")
    uid = uid_input.get_attribute("value")

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
    name_input.send_keys(filename)
    
    file_input = driver.find_element(By.ID, "id-mesh")
    driver.execute_script("arguments[0].style.display = 'block';", file_input)
    file_input.send_keys(stl_file_path)
    # Alle span.widget-title Elemente holen
    all_toggles = driver.find_elements(By.CSS_SELECTOR, "span.widget-title")

    # Durchgehen und das mit "Thumbnail" im Textinhalt finden
    update_thumbnail(driver)
    send_progress(55, "Updated Thumbnail successfully.")
    send_progress(60, "Changed CAD file of existing workpiece successfully.")
except Exception as e:
    send_progress(0, f"Error changing CAD file: {e}")
    driver.quit()
    exit(1)

try:
    # Save Workpiece
    save_button = driver.find_element(By.XPATH, "//button[@type='submit']")
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

        if(objectType == "TStueck"):
            driver.get(f'{href}')

            input_rotation_x = driver.find_element(By.NAME,"rotation_x")
            input_rotation_x.clear()
            input_rotation_x.send_keys(gp["rx"])

            input_rotation_y = driver.find_element(By.NAME,"rotation_y")
            input_rotation_y.clear()
            input_rotation_y.send_keys(gp["ry"])

            input_gripping_point_y = driver.find_element(By.NAME,"position_y")
            input_gripping_point_y.clear()
            input_gripping_point_y.send_keys(gp["y"])
        
        elif(objectType == "Rohr"):
            driver.get(f'{href}')

            if(gp_count == 0):
                input_rotation_y = driver.find_element(By.NAME,"rotation_y")
                input_rotation_y.clear()
                input_rotation_y.send_keys(-90)
            elif(gp_count == 1):
                input_rotation_y = driver.find_element(By.NAME,"rotation_y")
                input_rotation_y.clear()
                input_rotation_y.send_keys(-90)

                input_rotation_z = driver.find_element(By.NAME,"rotation_z")
                input_rotation_z.clear()
                input_rotation_z.send_keys(180)

        elif(objectType == "LStueck"):
            driver.get(f'{href}')

            input_rotation_x = driver.find_element(By.NAME,"rotation_x")
            input_rotation_x.clear()
            input_rotation_x.send_keys(0)

            input_rotation_z = driver.find_element(By.NAME,"rotation_z")
            input_rotation_z.clear()
            input_rotation_z.send_keys(0)

            input_gripping_point_x = driver.find_element(By.NAME,"position_x")
            input_gripping_point_x.clear()
            input_gripping_point_x.send_keys(gp["x"])
            
            input_gripping_point_y = driver.find_element(By.NAME,"position_y")
            input_gripping_point_y.clear()
            input_gripping_point_y.send_keys(gp["y"])

            input_rotation_x = driver.find_element(By.NAME,"rotation_x")
            input_rotation_x.clear()
            input_rotation_x.send_keys(180)

            input_rotation_z = driver.find_element(By.NAME,"rotation_z")
            input_rotation_z.clear()
            input_rotation_z.send_keys(-145)


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
        select_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "id_picking_object"))
        )
        # Find the Select Element
        select_element = driver.find_element(By.ID, "id_picking_object")

        # Create a Select Object
        select = Select(select_element)

        # Select by visible text
        select.select_by_visible_text(filename)
        # Wait for the save button to be clickable instead of sleep
        save_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
        )
        save_button.click()


        # Wait for navigation to localization page
        localization_path = href.replace("/edit/", "/localization/")
        driver.get(localization_path)

        # STEP 7.1: Edit Current
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "id-loca-start-edit"))).click()
        
        # STEP 7.2: Wait for UI to settle (optional)
        select_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "select.select.form-control"))
        )
        select = Select(select_element)
        select.select_by_visible_text(f"Picked object ({filename})")

        model_feature_path = f"{localization_path}features/start-edit/"
        driver.get(model_feature_path)

        feature_elements =  driver.find_elements(By.CSS_SELECTOR, ".item[data-item-id]")
        feature_count = 0
        for ele in feature_elements:
            driver.execute_script("arguments[0].click();", ele)
            if(objectType == "LStueck" ):
                if feature_count == 0:
                    height_input = driver.find_element(By.ID, "id_size_height")
                    depth_input = driver.find_element(By.ID, "id_size_depth")

                    height_input.clear()
                    height_input.send_keys(workpiece_radius * 2)
                    depth_input.clear()
                    depth_input.send_keys(workpiece_radius * 2)

                    pos_x_input = driver.find_element(By.ID, "id_position_x")
                    pos_y_input = driver.find_element(By.ID, "id_position_y")
                    pos_z_input = driver.find_element(By.ID, "id_position_z")

                    pos_x_input.clear()
                    pos_x_input.send_keys(0)
                    pos_y_input.clear()
                    pos_y_input.send_keys(0)
                    pos_z_input.clear()
                    pos_z_input.send_keys(0)

                elif feature_count == 1:
                    height_input = driver.find_element(By.ID, "id_size_height")
                    depth_input = driver.find_element(By.ID, "id_size_depth")

                    height_input.clear()
                    height_input.send_keys(workpiece_radius * 2)
                    depth_input.clear()
                    depth_input.send_keys(workpiece_radius * 2)

                    pos_x_input = driver.find_element(By.ID, "id_position_x")
                    pos_y_input = driver.find_element(By.ID, "id_position_y")
                    pos_z_input = driver.find_element(By.ID, "id_position_z")
                    rot_z_input = driver.find_element(By.ID, "id_rotation_z")

                    pos_x_input.clear()
                    pos_x_input.send_keys(workpiece_laenge)
                    pos_y_input.clear()
                    pos_y_input.send_keys(workpiece_laenge)
                    pos_z_input.clear()
                    pos_z_input.send_keys(0)
                    rot_z_input.clear()
                    rot_z_input.send_keys(-90)
                elif feature_count == 2:
                    height_input = driver.find_element(By.ID, "id_size_height")
                    depth_input = driver.find_element(By.ID, "id_size_depth")

                    height_input.clear()
                    height_input.send_keys(workpiece_radius * 2)
                    depth_input.clear()
                    depth_input.send_keys(workpiece_radius * 2)

                    pos_x_input = driver.find_element(By.ID, "id_position_x")
                    pos_y_input = driver.find_element(By.ID, "id_position_y")
                    pos_z_input = driver.find_element(By.ID, "id_position_z")

                    pos_x_input.clear()
                    pos_x_input.send_keys(workpiece_laenge + workpiece_radius)
                    pos_y_input.clear()
                    pos_y_input.send_keys(workpiece_radius)
                    pos_z_input.clear()
                    pos_z_input.send_keys(0)
                    
            feature_count += 1

        save_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "save-button"))
        )
        save_button.click()

        driver.get(localization_path +"start-edit/")


        # STEP 7.3: Scan & Locate
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "id-scan-and-locate"))).click()


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
    send_progress(100, f"Solution deployed successfully. ProgVision ID: {uid}")
except Exception as e:
    send_progress(0, f"Error during deployment or finalization: {e}")
    driver.quit()
    exit(1)

# Final cleanup
driver.quit()
