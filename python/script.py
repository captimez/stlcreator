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
client_connected = False



# Function to send progress updates
def send_progress(percentage, message):
    progress_data = {
        "percentage": percentage,
        "message": message
    }
    print(json.dumps(progress_data))  # Send JSON data to the console or UI

def send_to_sps(nodeId,value):
    try:
        global client_connected
        if not client_connected:
            client.connect()
            client_connected = True

        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)       
        client_node.set_value(client_node_dv)
        
        send_progress(5, f"Value {value} sent to node SPS successfully.")
    except Exception as e:
        send_progress(0, f"Error sending value to SPS: {e}")
        if client_connected:
            client.disconnect()
            client_connected = False

def send_string_to_sps(nodeId, value):
    try:
        global client_connected
        if not client_connected:
            client.connect()
            client_connected = True

        client_node = client.get_node(nodeId)
        client_node_value = str(value)
        client_node_dv = ua.DataValue(ua.Variant(client_node_value, ua.VariantType.String))
        
        client_node.set_value(client_node_dv)
        send_progress(5, f"String {client_node_value} sent to node SPS successfully.")
    except Exception as e:
        send_progress(0, f"Error sending string to SPS: {e}")
        if client_connected:
            client.disconnect()
            client_connected = False

def cleanup_and_exit(code=1):
    try:
        driver.quit()
    except:
        pass
    try:
        if client_connected:
            client.disconnect()
    except:
        pass
    exit(code)

def create_data_value(value, datatype):
    try:
        if datatype == ua.VariantType.String:
            value = str(value)
            return ua.DataValue(ua.Variant(value, ua.VariantType.String))
        elif datatype == ua.VariantType.Double:
            value = float(value)
            return ua.DataValue(ua.Variant(value, ua.VariantType.Double))
        elif datatype == ua.VariantType.Float:
            value = float(value)
            return ua.DataValue(ua.Variant(value, ua.VariantType.Float))
        elif datatype == ua.VariantType.Int32 or datatype == ua.VariantType.Int64:
            value = int(value)
            return ua.DataValue(ua.Variant(value, datatype))
        elif datatype == ua.VariantType.UInt16:
            value = int(value)
            return ua.DataValue(ua.Variant(value, ua.VariantType.UInt16))
        elif datatype == ua.VariantType.Boolean:
            value = bool(value)
            return ua.DataValue(ua.Variant(value, ua.VariantType.Boolean))
        else:
            raise ValueError(f"Unsupported datatype: {datatype}")
    except Exception as e:
        send_progress(0, f"Error creating data value: {e}")

    
    
def send_all_to_sps(stl_file_name, uid, aussendurchmesser, innendurchmesser, schulterdurchmesser, hoehe):
    try:
        delay = 0.2
        global client_connected
        if not client_connected:
            client.connect()
            client_connected = True

        nodeId = 'ns=3;s="Edit_DB"."Aktiv"."StlName"'
        value = stl_file_name
        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)       
        client_node.set_value(client_node_dv)
        time.sleep(delay)

        nodeId = 'ns=3;s="Edit_DB"."Aktiv"."ProgVision"'
        value = uid
        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)       
        client_node.set_value(client_node_dv)
        time.sleep(delay)

        nodeId = 'ns=3;s="Edit_DB"."Aktiv"."Aussendurchmesser"'
        value = aussendurchmesser
        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)       
        client_node.set_value(client_node_dv)
        time.sleep(delay)

        nodeId = 'ns=3;s="Edit_DB"."Aktiv"."Innendurchmesser"'
        value = innendurchmesser
        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)       
        client_node.set_value(client_node_dv)
        time.sleep(delay)

        nodeId = 'ns=3;s="Edit_DB"."Aktiv"."Schulterdurchmesser"'
        value = schulterdurchmesser
        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)       
        client_node.set_value(client_node_dv)
        time.sleep(delay)

        nodeId = 'ns=3;s="Edit_DB"."Aktiv"."Teilebreite"'
        value = hoehe
        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)       
        client_node.set_value(client_node_dv)

        nodeId = 'ns=3;s="Edit_DB"."Aktiv"."Teilegewicht"'
        value = workpiece_gewicht
        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)
        client_node.set_value(client_node_dv)
        time.sleep(delay)

        nodeId = 'ns=3;s="Edit_DB"."Aktiv"."WerteGueltig"'
        value = 1
        client_node = client.get_node(nodeId)
        datatype = client_node.get_data_type_as_variant_type()
        client_node_dv = create_data_value(value, datatype)
        client_node.set_value(client_node_dv)
        time.sleep(delay)
        
        send_progress(15, "Alle SPS-Werte erfolgreich gesendet.")

        if client_connected:
            client.disconnect()
            client_connected = False
    except Exception as e:
        send_progress(0, f"Fehler beim Senden an SPS: {e}")
        if client_connected:
            client.disconnect()
            client_connected = False
        cleanup_and_exit(1)


def update_thumbnail(driver, all_toggles):
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
        stl_file_name = config["selectedFile"]
        stl_file_path = f'{config["stlSavePath"]}/{config["selectedFile"]}.stl'
        filename = config["selectedFile"].split(".")[0]
        objectType = config["type"]
        copyIdOr = config["solutionIdOr"]
        copyIdIr = config["solutionIdIr"]
        solution_name = config["solutionName"]
        if objectType == "Aussenring" or objectType == "Innenring":
            workpiece_gewicht = config['gewicht']
            workpiece_aussendurchmesser = config['aussendurchmesser']
            workpiece_innendurchmesser = config['innendurchmesser']
            workpiece_schulterdurchmesser = config['schulterdurchmesser']
            workpiece_hoehe = config['hoehe']
        
    send_progress(5, "Loaded configuration file successfully.")
except Exception as e:
    send_progress(0, f"Error loading config file: {e}")
    cleanup_and_exit(1)

workpiece_innenradius = workpiece_innendurchmesser / 2
workpiece_aussenradius = workpiece_aussendurchmesser / 2

grip_depth = 17.5
grip_tolerance = 2 
max_grip_depth = grip_depth - grip_tolerance 

if(objectType == "Aussenring" or objectType == "Innenring"):
    gp = {
        "x": workpiece_innenradius + ((workpiece_aussenradius - workpiece_innenradius) / 2),
        "y": 0, 
        "z": ((workpiece_hoehe / 2) - max_grip_depth), 
        "rx": 0, 
        "ry": 0, 
        "rz": 0,
    }



#Photoneo BPS IP
#photoneo_ip = "http://192.168.2.1" 
photoneo_ip = "http://127.0.0.1"  # Localhost for testing
def get_default_chrome_options():
    options = webdriver.ChromeOptions()
    #options.add_argument("--headless=inew")  # Verwende den neuen Headless-Modus
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    return options

try:
    # Initialize WebDriver
    base = os.path.dirname(os.path.abspath(__file__))
    chromedriver_path = os.path.join(base, 'chromedriver')
    #service = Service(exectuable_path= chromedriver_path)
    
    options = get_default_chrome_options()
    options.page_load_strategy = 'eager'
    driver = webdriver.Chrome(options=options)
    #driver = webdriver.Edge()
    driver.implicitly_wait(10)
    send_progress(10, "Initialized WebDriver successfully.")
except Exception as e:
    send_progress(0, f"Error initializing WebDriver: {e}")
    cleanup_and_exit(1)

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
    cleanup_and_exit(1)

try:
    driver.get(f"{photoneo_ip}/deployment")
    # Warte nur kurz (z.B. 2 Sekunden) auf den Stop-Button
    stop_button = WebDriverWait(driver, 2).until(
        EC.element_to_be_clickable((By.ID, "btn-deployment-action-stop"))
    )
    driver.execute_script("arguments[0].scrollIntoView();", stop_button)
    stop_button.click()
    send_progress(25, "Stopped deployment successfully.")
    driver.get(f"{photoneo_ip}/solutions/")
except Exception:
    driver.get(f"{photoneo_ip}/solutions/")
    send_progress(25, "No Deployment, continuing...")

try:
    # Get all existing Solution IDs
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'a[href*="solution/"][href$="/detail/"]')))
    links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="solution/"][href$="/detail/"]')
    solution_ids = []
    for link in links:
        href = link.get_attribute("href")
        match = re.search(r'solution/(\d+)/detail', href)
        if match:
            solution_ids.append(int(match.group(1)))
    if not solution_ids:
        raise ValueError("No solutions found.")
    
    if objectType == "Aussenring":
        template_id = copyIdOr
    elif objectType == "Innenring": 
        template_id = copyIdIr
    if template_id is None:
        raise ValueError(f"No template solution found for type {objectType} with ID {copyIdOr if objectType == 'Aussenring' else copyIdIr}.")

    send_progress(30, "Retrieved all existing solution IDs.")
except Exception as e:
    send_progress(0, f"Error retrieving solution IDs: {e}")
    cleanup_and_exit(1)

try:
    # Duplicate Template Solution
    driver.get(f'{photoneo_ip}/solution/{template_id}/duplicate')
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "id_name")))
    name_input = driver.find_element(By.ID, "id_name")
    name_input.clear()
    name_input.send_keys(solution_name)

    uid_input = driver.find_element(By.ID, "id_uid")
    uid = uid_input.get_attribute("value")
    send_all_to_sps(filename, uid, workpiece_aussendurchmesser, workpiece_innendurchmesser, workpiece_schulterdurchmesser, workpiece_hoehe)
    time.sleep(2)
    duplicate_button = driver.find_element(By.ID, "duplicate-solution-btn")
    duplicate_button.click()
    send_progress(40, "Duplicated template solution successfully.")
except Exception as e:
    send_progress(0, f"Error duplicating template solution: {e}")
    cleanup_and_exit(1)

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
    cleanup_and_exit(1)

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
    update_thumbnail(driver,all_toggles)
    send_progress(55, "Updated Thumbnail successfully.")
    name_input.send_keys("" + filename)
    file_input = driver.find_element(By.ID, "id-mesh")
    driver.execute_script("arguments[0].style.display = 'block';", file_input)
    file_input.send_keys(stl_file_path)
    send_progress(60, "Changed CAD file of existing workpiece successfully.")
except Exception as e:
    send_progress(0, f"Error changing CAD file: {e}")
    cleanup_and_exit(1)

try:
    # Save Workpiece
    save_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    time.sleep(2)
    save_button.click()
    time.sleep(2)
    send_progress(70, "Saved workpiece successfully.")
except Exception as e:
    send_progress(0, f"Error saving workpiece: {e}")
    cleanup_and_exit(1)

try:
    # Navigate to Gripping Points
    driver.get(f"{photoneo_ip}/solution/{solution_id}/gripping_points/")
    gripping_point_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="solution/"][href*="/gripping_points/"]')
    gripping_point_hrefs = [link.get_attribute("href") for link in gripping_point_links]
    gp_count = 0
    for href in gripping_point_hrefs:

        if(objectType == "Aussenring" or objectType == "Innenring"):
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
    cleanup_and_exit(1)

try:
    # STEP 5: Go to Vision System
    driver.get(f"{photoneo_ip}/solution/{solution_id}/vision/")
    send_progress(85, "Navigated to Vision System successfully.")
except Exception as e:
    send_progress(0, f"Error navigating to Vision System: {e}")
    cleanup_and_exit(1)

try:
    # STEP 6: Get all Box Localization links
    box_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/vision/"][href$="/edit/"]')
    box_hrefs = [link.get_attribute("href") for link in box_links]

    for href in box_hrefs:
        driver.get(href)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "id_picking_object"))
        )

        # Find the Select Element
        select_element = driver.find_element(By.ID, "id_picking_object")

        # Create a Select Object
        select = Select(select_element)

        # Select by visible text
        select.select_by_visible_text(filename)
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
        )



        save_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        save_button.click()

        # Warte, bis die Seite nach dem Speichern geladen ist (z.B. auf ein bekanntes Element)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        localization_path = href.replace("/edit/", "/localization/")
        driver.get(localization_path)

        # STEP 7.1: Edit Current
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "id-loca-start-edit"))).click()

        #Go To Features
        if(objectType == "Aussenring"):
            model_feature_path = f"{localization_path}features/start-edit/"
            driver.get(model_feature_path)

            feature_elements =  driver.find_elements(By.CSS_SELECTOR, ".item[data-item-id]")
            feature_count = 0
            for ele in feature_elements:
                driver.execute_script("arguments[0].click();", ele)
                width_input = WebDriverWait(driver,10).until(
                    EC.presence_of_element_located((By.ID, "id_size_width"))
                )
                height_input = WebDriverWait(driver,10).until(
                    EC.presence_of_element_located((By.ID, "id_size_height"))
                )
                depth_input = WebDriverWait(driver,10).until(
                    EC.presence_of_element_located((By.ID, "id_size_depth"))
                )
            
                pos_z_input = WebDriverWait(driver,10).until(
                    EC.presence_of_element_located((By.ID, "id_position_z"))
                )

                depth = workpiece_hoehe / 5
                alignment_pos_z = (workpiece_hoehe / 2) - (depth * 0.25)

                width_input.clear()
                width_input.send_keys(workpiece_aussendurchmesser + (workpiece_aussendurchmesser / 10))
                height_input.clear()
                height_input.send_keys(workpiece_aussendurchmesser + (workpiece_aussendurchmesser / 10))
                depth_input.clear()
                depth_input.send_keys(depth)

                pos_z_input.clear()
                pos_z_input.send_keys(alignment_pos_z)
            
                save_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "save-button"))
                )
                save_button.click()


            driver.get(localization_path +"start-edit/")
        # STEP 7.2: Wait for UI to settle (optional)
        # time.sleep(1)
        # Stattdessen: Warte, bis das Select-Element sichtbar ist
        select_element = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "select.select.form-control"))
        )
        select = Select(select_element)
        
        select.select_by_visible_text(f"Picked object ({filename})")
        # time.sleep(2)
        # Stattdessen: Warte, bis der Scan-&-Locate-Button klickbar ist
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "id-scan-and-locate"))
        )

        # STEP 7.3: Scan & Locate
        driver.find_element(By.ID, "id-scan-and-locate").click()

        # STEP 7.4: Wait for scan to complete
        # time.sleep(2)
        # Stattdessen: Warte, bis der Save-Button klickbar ist
        save_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.ID, "id-save-localization_profile"))
        )
        driver.execute_script("arguments[0].removeAttribute('disabled')", save_button)
        save_button.click()

        # STEP 7.5: Save configuration
        save_button = WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.ID, "id-save-localization_profile"))
        )
        driver.execute_script("arguments[0].removeAttribute('disabled')", save_button)
        save_button.click()

        # STEP 7.6: Quit localization
        WebDriverWait(driver, 30).until(EC.element_to_be_clickable((By.ID, "id-exit-localization"))).click()

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
    cleanup_and_exit(1)

try:
    # STEP 8: Deployment
    driver.find_element(By.ID, "deploy-btn").click()
    send_progress(95, "Deployment initiated successfully.")
except Exception as e:
    send_progress(0, f"Error initiating deployment: {e}")
    cleanup_and_exit(1)

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
    cleanup_and_exit(1)

# Final cleanup
cleanup_and_exit(0)
