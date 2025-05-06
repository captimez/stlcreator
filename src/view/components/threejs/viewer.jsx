import * as THREE from 'three';
import * as React from "react";
import './viewer.css';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IconButton } from '@mui/material';
import { Refresh } from '@mui/icons-material';

/**
 * MyThree - React-Komponente für das Anzeigen von STL-Dateien mit Three.js.
 *
 * Diese Komponente lädt und rendert STL-Dateien basierend auf dem `props.name`-Wert.
 * Sie unterstützt Maussteuerung, ein Gitter und eine Beleuchtungsszene.
 *
 * @param {Object} props - Die übergebenen Eigenschaften.
 * @param {string} props.name - Der Name der STL-Datei (ohne Dateiendung), die gerendert werden soll.
 */
function MyThree(props) {
  const refContainer = React.useRef(null);
  const sceneRef = React.useRef(new THREE.Scene());
  const meshRef = React.useRef(null); // Referenz für das STL-Mesh

  
  /**
   * Lädt und rendert eine STL-Datei neu, indem das alte Modell entfernt und ersetzt wird.
   */
  const reRenderSTL = () => {
    const scene = sceneRef.current;

    console.error("Re-rendering STL:", props.name);
    // Debugging: Anzahl der vorhandenen Kinder in der Szene
    console.log("Meshes before cleanup:", scene.children.length);

    // 🔁 ALLE vorhandenen Meshes entfernen (z. B. durch versehentliche Mehrfach-Loads)
    scene.children
      .filter(obj => obj.type === 'Mesh')
      .forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        scene.remove(mesh);
      });

    // 🔁 meshRef resetten (für späteren Zugriff)
    meshRef.current = null;

    // Debugging: Anzahl der Kinder nach der Bereinigung
    console.log("Meshes after cleanup:", scene.children.length);

    // Lade neues STL-Modell
    const loader = new STLLoader();
    window.api.getSaveFolder().then((saveFolderPath) => {
      const filePath = `file://${saveFolderPath}/demo/${props.name}.stl`; // ✅ Correct path

      loader.load(filePath, (geometry) => {
        const material = new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
          metalness: 0.3,
          roughness: 0.6
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Rotation anpassen
        meshRef.current = mesh; // Save reference
        
        scene.add(mesh);

        // Debugging: Anzahl der Kinder nach dem Hinzufügen des neuen Meshes
        console.log("Meshes after adding new STL:", scene.children.length);
      });
    });
  };
  
  React.useEffect(() => {
    const container = document.getElementById("boxbox");
    const scene = sceneRef.current;

    if (!container) return;

    // Initiale Breite und Höhe berechnen
    const { width } = container.getBoundingClientRect();
    const height = 500;

    // THREE.js Kamera, Szene und Renderer initialisieren
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    refContainer.current && refContainer.current.appendChild(renderer.domElement);

    // OrbitControls für Maussteuerung
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Dämpfung für geschmeidige Bewegung

    // Kamera-Position setzen
    camera.position.set(0, 10, 20);
    scene.background = new THREE.Color(0xffffff);

    // Beleuchtung hinzufügen
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // Hilfsgitter für die Szene
    const gridSize = 1000;
    const gridDivisions = 50;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444);
    scene.add(gridHelper);

    //Koordinatenachsen
    const axesHelper = new THREE.AxesHelper(100);
    axesHelper.scale.set(3, 3, 3); // Setze die Skalierung der Achsen
    scene.add(axesHelper);

    // Fenstergrößen-EventListener
    const handleResize = () => {
      const { width } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose(); // Renderer bereinigen
    };
  }, []);

  React.useEffect(() => {
    // Registriere den Event-Listener nur einmal
    const handleStlUpdate = () => {
      console.log("STL update triggered");
      reRenderSTL();
    };

    window.api.onStlUpdate(handleStlUpdate);

    // Cleanup-Funktion, um den Event-Listener zu entfernen
    return () => {
      window.api.removeUpdateInfoListeners();
    };
  }, []); // Nur einmal beim Mount ausführen

  React.useEffect(() => {
    // Reagiere auf Änderungen des ausgewählten Bauteils
    console.log("Selected Bauteil changed:", props.name);
    reRenderSTL();
  }, [props.name]); // Wird ausgeführt, wenn sich props.name ändert

  return (
    <div ref={refContainer} className="canvas">
      {/* Button zum Neuladen des Modells */}
      <IconButton sx={{ mt: 1.5, ml: 2 }} onClick={() => reRenderSTL()}>
        <Refresh />
      </IconButton>
    </div>
  );
}

export default MyThree;

