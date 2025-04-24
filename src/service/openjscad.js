import { extrudeRotate } from '@jscad/modeling/src/operations/extrusions';
import { ellipse, roundedCylinder } from '@jscad/modeling/src/primitives';
import { Buffer } from 'buffer';
import { deinterleaveAttribute } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { or } from 'three/tsl';
import { UniformNode } from 'three/webgpu';

// Import der JSCAD-Bibliotheken
const { cylinder, cuboid, cylinderElliptic, torus } = require('@jscad/modeling').primitives;
const { subtract, union } = require('@jscad/modeling').booleans;
const { translate, rotate} = require('@jscad/modeling').transforms;
const { serialize } = require('@jscad/stl-serializer');

const resolution = await window.api.getResolution();
console.log(resolution)
function createAussenring1({
  aussendurchmesser,
  innendurchmesser,
  hoehe,
  breite_aussen,
  breite_innen,
  tiefe_innen,
  resolution = 30, // Standardauflösung, falls nicht angegeben
}) {
  // Eingabewerte validieren
  if (
    !aussendurchmesser || aussendurchmesser <= 0 ||
    !innendurchmesser || innendurchmesser <= 0 ||
    !hoehe || hoehe <= 0 ||
    !breite_aussen || breite_aussen <= 0 ||
    !breite_innen || breite_innen <= 0 ||
    !tiefe_innen || tiefe_innen <= 0
  ) {
    throw new Error('Alle Eingabeparameter müssen positive Werte haben.');
  }

  console.log('Eingabeparameter:');
  console.log('aussendurchmesser:', aussendurchmesser);
  console.log('innendurchmesser:', innendurchmesser);
  console.log('hoehe:', hoehe);
  console.log('breite_aussen:', breite_aussen);
  console.log('breite_innen:', breite_innen);
  console.log('tiefe_innen:', tiefe_innen);
  console.log('resolution:', resolution);

  // Umrechnen der Maße
  const Durchmesser_aussen = Number(aussendurchmesser) 
  const Durchmesser_innen = Number(innendurchmesser) 
  const Breite = Number(hoehe) 
  const Breite_aussen = Number(breite_aussen) 
  const Breite_innen = Number(breite_innen) 
  const Tiefe_innen = Number(tiefe_innen) 
  const rak = (Breite - Breite_aussen) / 2;

  // Außen Zylinder
  let aussen_zylinder =cylinder({
    radius: Durchmesser_aussen / 2,
    height: Breite_aussen,
    segments: resolution,
  });

  let aussen_zylinder_rundung = cylinderElliptic({
    height: rak,
    startRadius: [Durchmesser_aussen / 2, Durchmesser_aussen / 2],
    endRadius: [innendurchmesser / 2, innendurchmesser / 2],
  })
  let aussen_zylinder_rundung2 = cylinderElliptic({
    height: rak,
    startRadius: [innendurchmesser / 2, innendurchmesser / 2],
    endRadius: [Durchmesser_aussen / 2, Durchmesser_aussen / 2],
  });
  aussen_zylinder_rundung2 = translate([0, 0, -((Breite_aussen / 2 ) + (rak/2))], aussen_zylinder_rundung2);  

  aussen_zylinder_rundung = translate([0, 0, ((Breite_aussen / 2)+(rak/2))], aussen_zylinder_rundung);

  aussen_zylinder = union(aussen_zylinder, aussen_zylinder_rundung,aussen_zylinder_rundung2);
  // Innen Zylinder
  const innen_zylinder = cylinder({
    radius: Durchmesser_innen / 2,
    height: Breite,
    segments: resolution,
  });

  // Innenlaufbahn Zylinder
  const laufbahn = cylinder({
    radius: (Durchmesser_innen / 2) + Tiefe_innen,
    height: Breite_innen,
    segments: resolution,
  });

  const mainRing = subtract(aussen_zylinder, innen_zylinder);

  return subtract(mainRing, laufbahn);
}


// Funktion für Außenring2
function createAussenring2({
    innendurchmesser_klein,
    innendurchmesser_gross,
    aussendurchmesser,
    hoehe,
  }) {
    // Parameterberechnung
    const D_aussen = Number(aussendurchmesser) 
    const D_gr_innen = Number(innendurchmesser_gross) 
    const D_kl_innen = Number(innendurchmesser_klein) 

    console.log(hoehe);
    console.log(D_aussen);
    console.log(D_gr_innen);
    console.log(D_kl_innen);
  
    const aussenradius = D_aussen / 2;
    const rklein = D_kl_innen / 2;
    const rgross = D_gr_innen / 2;
  
    const resolution = 50; // Auflösung für glatte Zylinder
  
    // Äußerer Zylinder
    const outerCylinder = cylinder({ height: hoehe, radius: aussenradius, segments: resolution });
  
    // Innerer Zylinder
    const innerCylinder = cylinder({ height: hoehe + 1, radius: rklein, segments: resolution });
  
    // Bauteilschräge mit elliptischer Geometrie
    const slopedCylinder = cylinderElliptic({
        height: hoehe + 1, 
        startRadius: [rgross, rgross], // Start-Ellipse
        endRadius: [rklein, rklein],   // End-Ellipse
        segments: 50
    });
  
    // Subtraktion der inneren Zylinder und der Schräge
    const result = subtract(outerCylinder, innerCylinder, slopedCylinder);
  
    // Rotation für die richtige Ausrichtung (90 Grad um Y-Achse)
    return rotate([0, Math.PI / 2, 0], result);
  }

// Funktion für Innenring1
function createInnenring1({ durchmesser_or, durchmesser_so, durchmesser_su, durchmesser_ur,innendurchmesser, hoehe_or, hoehe, hoehe_ur }) {
  durchmesser_or = Number(durchmesser_or) 
  durchmesser_so = Number(durchmesser_so) 
  durchmesser_su = Number(durchmesser_su) 
  durchmesser_ur = Number(durchmesser_ur)
  innendurchmesser = Number(innendurchmesser)
  hoehe_or = Number(hoehe_or)
  hoehe = Number(hoehe) 
  hoehe_ur = Number(hoehe_ur) 
  
  let or_clyinder = cylinder({ radius: durchmesser_or / 2, height: hoehe_or, segments: resolution });
  let ur_clyinder = cylinder({ radius: durchmesser_ur / 2, height: hoehe_ur, segments: resolution });
  let middle_cylinder_height = hoehe - (hoehe_or + hoehe_ur);
  let middle_cylinder = cylinderElliptic({ startRadius: [durchmesser_so / 2, durchmesser_so / 2], endRadius: [durchmesser_su / 2, durchmesser_su / 2], height: middle_cylinder_height , segments: resolution });

  let gesamt = union(translate([0, 0, (hoehe_or / 2)], or_clyinder), translate([0, 0, ((middle_cylinder_height) +( hoehe_ur / 2) + (hoehe_or))],ur_clyinder), translate([0, 0, (middle_cylinder_height / 2) + (hoehe_or)], middle_cylinder))
  let inner_cylinder = cylinder({ radius: innendurchmesser / 2, height: hoehe, segments: resolution });
  inner_cylinder = translate([0,0,(hoehe/ 2)], inner_cylinder);
  gesamt = subtract(gesamt, inner_cylinder);
  return gesamt;
}

function createInnenring() {
  // Parameterzuweisung
  let Hoehe = 100;
  let Durchmesser_Innen = 60;
  let Durchmesser_oberer_Rand = 80;
  let Hoehe_oberer_Rand = 10;
  let Durchmesser_Rand_unten = 90;
  let Hoehe_unterer_Rand = 15;
  let Durchmesser_Schraege_oben = 75;
  let Durchmesser_Schraege_unten = 65;

  // Umrechnung der Parameter
  let R_rand_oben = Durchmesser_oberer_Rand / 2;
  let R_innen = Durchmesser_Innen / 2;
  let R_schraege_oben = Durchmesser_Schraege_oben / 2;
  let R_schraege_unten = Durchmesser_Schraege_unten / 2;
  let R_rand_unten = Durchmesser_Rand_unten / 2;
  let a = Hoehe - Hoehe_oberer_Rand - Hoehe_unterer_Rand;

  let resolution = 50;

  // Oberer Rand
  let obererRand = difference(
    cylinder({h: Hoehe_oberer_Rand, r: R_rand_oben, fn: resolution}),
    cylinder({h: Hoehe_oberer_Rand, r: R_innen, fn: resolution})
  ).translate([0, 0, Hoehe_unterer_Rand + a]);

  // Schräge + Einstiche
  let schräge = difference(
    cylinder({h: a, r1: R_schraege_unten, r2: R_schraege_oben, fn: resolution}),
    union(
      cylinder({h: a + 1, r: R_innen, fn: resolution}),
      rotate_extrude({fn: resolution}, circle({r: 1, fn: resolution}).translate([R_schraege_unten, 0])),
      rotate_extrude({fn: resolution}, circle({r: 1, fn: resolution}).translate([R_schraege_oben, 0])).translate([0, 0, a])
    )
  ).translate([0, 0, Hoehe_unterer_Rand]);

  // Unterer Rand
  let untererRand = difference(
    cylinder({h: Hoehe_unterer_Rand, r: R_rand_unten, fn: resolution}),
    cylinder({h: Hoehe_unterer_Rand + 1, r: R_innen, fn: resolution})
  );

  // Gesamtes Objekt zusammenfügen und um 90° drehen
  let gesamtesObjekt = union(obererRand, schräge, untererRand)
    .rotateX(90)
    .rotateY(90);

  return gesamtesObjekt;
}
// Funktion für Innenring2
function createInnenring2({ innendurchmesser, aussendurchmesser, hoehe, radius_ausstich }) {
  innendurchmesser = Number(innendurchmesser) 
  aussendurchmesser = Number(aussendurchmesser) 
  hoehe = Number(hoehe);
  radius_ausstich = Number(radius_ausstich);

  const outer = cylinder({ radius: aussendurchmesser / 2, height: hoehe, segments: resolution  });
  const inner = cylinder({ radius: innendurchmesser / 2, height: hoehe + 1, segments: resolution  });
   
  let kreis = ellipse({ radius: [radius_ausstich, radius_ausstich], center:[aussendurchmesser/2, 0], segments: resolution}); // Querschnitt des Rohres 
  kreis = extrudeRotate({ segments: resolution, startAngle: 0, angle: Math.PI*2 }, kreis); // Bogen erstellen
  kreis = translate([0, 0, 0], kreis); // Positionieren
 
  return subtract(subtract(outer, inner), kreis);
}

function createTstueck({
  zylinder_duchmesser_aussen,
  zylinder_duchmesser_innen,
  zylinder2_durchmesser_aussen,
  zylinder2_duchemsser_innen,
  laenge,
  hoehe,
}) {

  zylinder_duchmesser_aussen = Number(zylinder_duchmesser_aussen);
  zylinder_duchmesser_innen = Number(zylinder_duchmesser_innen);
  zylinder2_durchmesser_aussen = Number(zylinder2_durchmesser_aussen);
  zylinder2_duchemsser_innen = Number(zylinder2_duchemsser_innen);
  laenge = Number(laenge);
  hoehe = Number(hoehe);
  console.log(zylinder_duchmesser_aussen);

  
  let zylinderBottomHeight = (hoehe + (zylinder_duchmesser_aussen / 2));
  const topZylinderAussen = cylinder({ 
    radius: zylinder_duchmesser_aussen / 2, 
    height: laenge, 
    segments: resolution
  });
  console.log
  const topZylinder = translate(
  // Rotation um 90 Grad und Positionierung
    [0, 0, zylinderBottomHeight / 2], // Verschiebe den Zylinder zur Mitte des vertikalen Zylinders
    rotate([Math.PI / 2, 0, 0], topZylinderAussen) // Rotation um die X-Achse
  );

  // Bottom-Zylinder (vertikaler Zypplinder)
  const bottomZylinder = cylinder({ 
    radius: zylinder2_durchmesser_aussen / 2, 
    height: zylinderBottomHeight, 
    segments: resolution
  });

  // Außenkörper: Vereinigung von Top- und Bottom-Zylinder
  const tStueckAussen = union(topZylinder, bottomZylinder);

  // Innerer Hohlraum: Subtrahiere die inneren Zylinder
  /* const tStueck = subtract(tStueckAussen, innerTopZylinder, innerBottomZylinder); */
  const tStueck = tStueckAussen;

  return rotate([0, Math.PI/2, 0],tStueck);
}


function createRohrbogen({
  durchmesser,
  winkel,             // Winkel in Grad
  schenkel_laenge_1,  // Länge des ersten Zylinders
  schenkel_laenge_2,  // Länge des zweiten Zylinders
}) {

  durchmesser = Number(durchmesser) 
  schenkel_laenge_1 = Number(schenkel_laenge_1) 
  schenkel_laenge_2 = Number(schenkel_laenge_2) 

  const radius = Number(durchmesser / 2); // Außenradius des Rohres
  const winkelInRad = (winkel * Math.PI) / 180; // Winkel in Radiant umrechnen

  let schenkel1 = cylinder({ radius, height: schenkel_laenge_1, segments: resolution });
  schenkel1 = rotate([Math.PI / 2, 0, 0], schenkel1);
  schenkel1 = translate([0, schenkel_laenge_1 / 2, 0], schenkel1); // Positionieren

  // **Zylinder 2 (vertikaler Schenkel)**
  let schenkel2 = cylinder({ radius, height: schenkel_laenge_2, segments: resolution });

  // Position der unteren Vorderseite (Ecke) vor der Rotation
  const untereEckeVorRotation = {
    x: 0, // Keine Verschiebung entlang der X-Achse
    y: -schenkel_laenge_2 / 2, // Untere Hälfte des Zylinders
    z: radius, // Verschiebung nach hinten entlang der Z-Achse
  };

  // Berechne die Position der unteren Ecke nach der Rotation (um die X-Achse)
  const untereEckeNachRotation = {
    x: untereEckeVorRotation.x, // X-Koordinate bleibt unverändert
    y: (untereEckeVorRotation.y * Math.cos(winkelInRad)) - (untereEckeVorRotation.z * Math.sin(winkelInRad)), // Neue Y-Position
    z: (untereEckeVorRotation.y * Math.sin(winkelInRad)) + (untereEckeVorRotation.z * Math.cos(winkelInRad)), // Neue Z-Position
  };
  const kreisVerschiebungY = radius * Math.sin(winkelInRad);
  const kreisVerschiebungZ = radius * (-Math.cos(winkelInRad));
  // Zielposition der unteren Ecke
  const zielPosition = {
    x: 0,                             // X bleibt unverändert
    y: schenkel_laenge_1 + kreisVerschiebungY,    // Ende von Zylinder 1 + Radius
    z: radius+radius + kreisVerschiebungZ,                             // Z bleibt am Ursprung
  };

  // Berechne die Verschiebung
  const verschiebung = {
    x: zielPosition.x - untereEckeNachRotation.x,
    y: zielPosition.y - untereEckeNachRotation.y,
    z: zielPosition.z - untereEckeNachRotation.z,
  };

  //Speichere die Verschiebung in der Konfigurationsdatei
  //saveVerschiebungToConfig(verschiebung)

   // Bogen erstellen: Verbinden der beiden Zylinder
   let kreis = ellipse({ radius: [radius, radius], center:[radius + radius, 0], segments: resolution}); // Querschnitt des Rohres
   const bogen = extrudeRotate(
     { segments: resolution, startAngle: 0, angle: winkelInRad }, // Start und Bogenwinkel
     kreis
   );
 
   // Bogen positionieren
   const bogenPositioniert = translate([0, schenkel_laenge_1, radius + radius], rotate([0, Math.PI / 2, 0], bogen));


  // Wende die Verschiebung und Rotation auf Zylinder 2 an
  schenkel2 = rotate([winkelInRad, 0, 0], schenkel2); // Rotation um die X-Achse
  schenkel2 = rotate([Math.PI / 2, 0, 0], schenkel2);
  schenkel2 = translate([verschiebung.x, verschiebung.y, verschiebung.z], schenkel2);
  console.log(verschiebung);

  // **Zusammenfügen**
  const rohrbogen = rotate([0, Math.PI / 2, 0],union(schenkel1, bogenPositioniert, schenkel2));

  return rohrbogen;
}





async function exportSTL(fileName, demoName, model,dimensions) {
     // Serialisiere das Modell als binäre STL-Daten
     const stlData = serialize({ binary: true }, model); // Gibt ein Array von ArrayBuffer zurück

     // Zusammenführen aller ArrayBuffer in einen einzigen Buffer
     let totalLength = 0;
     stlData.forEach(buffer=> {
        totalLength += buffer.byteLength;
     })
     const mergedArray = new Uint8Array(totalLength); // Erstellt einen neuen ArrayBuffer mit der Gesamtlänge
 
     let offset = 0;
     stlData.forEach(buffer => {
         mergedArray.set(new Uint8Array(buffer), offset); // Kopiert den Inhalt jedes ArrayBuffer
         offset += buffer.byteLength; // Verschiebt den Offset für den nächsten Block
     });
 
     const finalBuffer = Buffer.from(mergedArray.buffer);
 
     // Definiere den Speicherpfad
     //const outputPath = `./output/${fileName}.stl`;
     //const demoOutputPath = `./dist/images/output/${demoName}.stl`;
    let response = null;
    try{
        window.api.getSaveFolder().then((saveFolderPath) => {
          const outputPath = `${saveFolderPath}/${fileName}.stl`;
          const demoOutputPath = `${saveFolderPath}/demo/${demoName}.stl`;

          // Save the file using the API
          window.api.saveSTL(demoOutputPath, finalBuffer).then(() => {
            console.log("✅ Demo STL file saved at:", demoOutputPath);
          });
          // Save the file using the API
          window.api.saveSTL(outputPath, finalBuffer).then(() => {
            console.log("✅ STL file saved at:", outputPath); 
            // Save the dimensions using the API
            window.api.updateDimensions(dimensions).then(() => {
              console.log("✅ Dimensions saved at:", dimensions);
            });
          });
        });
    }
    catch(error){
      throw error;
    }
}


async function saveVerschiebungToConfig(verschiebung) {
  try {
    // Speichern der Verschiebung in der Konfigurationsdatei
    await window.api.updateVerschiebung(verschiebung);
    console.log("✅ Verschiebung gespeichert:", verschiebung);
  } catch (error) {
    console.error("Fehler beim Speichern der Verschiebung:", error);
  }
}

// Funktion, um einen Ring zu erstellen
export async function createSTL(bauteil) {
    let model;
    let dimensions = {
      aussendurchmesser: 0,
      innendurchmesser: 0,
      hoehe: 0,
      thoehe: 0,
      laenge: 0,
    }
    switch(bauteil.name){
        case 'Aussenring1':
            model = createAussenring1(bauteil.inputs);
            dimensions.aussendurchmesser = bauteil.inputs.aussendurchmesser;
            dimensions.innendurchmesser = bauteil.inputs.innendurchmesser;
            dimensions.hoehe = bauteil.inputs.hoehe;
            break;
        case 'Aussenring2':
            model = createAussenring2(bauteil.inputs);
            dimensions.aussendurchmesser = bauteil.inputs.aussendurchmesser;
            dimensions.innendurchmesser = bauteil.inputs.innendurchmesser_klein;
            dimensions.hoehe = bauteil.inputs.hoehe;
            break;
        case 'Innenring1':
            model = createInnenring1(bauteil.inputs);
            dimensions.aussendurchmesser = bauteil.inputs.durchmesser_or;
            dimensions.innendurchmesser = bauteil.inputs.innendurchmesser;
            dimensions.hoehe = bauteil.inputs.hoehe; 
            break;
        case 'Innenring2':
            model = createInnenring2(bauteil.inputs);
            dimensions.aussendurchmesser = bauteil.inputs.aussendurchmesser;
            dimensions.innendurchmesser = bauteil.inputs.innendurchmesser;
            dimensions.hoehe = bauteil.inputs.hoehe;
            
            break;
        case 'T-Stueck':
            model = createTstueck(bauteil.inputs);
            dimensions.thoehe = bauteil.inputs.thoehe;
            break;
        case "Rohrbogen":
            model = createRohrbogen(bauteil.inputs);
            dimensions.laenge = bauteil.inputs.schenkel_laenge_1;
            
            break;

    }



    if(model){
      await exportSTL(bauteil.stlName, bauteil.name, model, dimensions);
    
    }
    return true;
}
