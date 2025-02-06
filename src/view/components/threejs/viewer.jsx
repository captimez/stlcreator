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

    // Entferne vorheriges STL-Mesh, falls vorhanden
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      meshRef.current.material.dispose();
      meshRef.current = null;
    }

    // Lade neues STL-Modell
    const loader = new STLLoader();
    loader.load(`../../../output/${props.name}.stl`, (geometry) => {
      const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.3, roughness: 0.6 });
      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current = mesh; // Referenz speichern
      scene.add(mesh);
    });
  }

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
    const gridSize = 100;
    const gridDivisions = 50;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x888888, 0x444444);
    scene.add(gridHelper);

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

  // Lädt das STL-Modell neu, wenn sich der Dateiname (props.name) ändert
  React.useEffect(() => {
    reRenderSTL();
  }, [props.name]);

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

