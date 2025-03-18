import { extrudeRotate } from '@jscad/modeling/src/operations/extrusions';
import { ellipse, roundedCylinder } from '@jscad/modeling/src/primitives';
import { Buffer } from 'buffer';

// Import der JSCAD-Bibliotheken
const { cylinder, cuboid, cylinderElliptic, torus } = require('@jscad/modeling').primitives;
const { subtract, union } = require('@jscad/modeling').booleans;
const { translate, rotate} = require('@jscad/modeling').transforms;
const { serialize } = require('@jscad/stl-serializer');

const resolution = 30;

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
function createInnenring1({ durchmesser_or, durchmesser_so, durchmesser_su, durchmesser_ur, hoehe_or, hoehe, hoehe_ur }) {
  durchmesser_or = Number(durchmesser_or) 
  durchmesser_so = Number(durchmesser_so) 
  durchmesser_su = Number(durchmesser_su) 
  durchmesser_ur = Number(durchmesser_ur) 
  hoehe_or = Number(hoehe_or)
  hoehe = Number(hoehe) 
  hoehe_ur = Number(hoehe_ur) 
    const outer = cylinder({  radius: durchmesser_or / 2, height: hoehe, segments: resolution });
    const stepOuter = cylinder({ radius: durchmesser_so / 2, height: hoehe_or, segments: resolution  });
    const stepInner = cylinder({ radius: durchmesser_su / 2, height: hoehe_ur, segments: resolution  });
    const inner = cylinder({ radius: durchmesser_ur / 2, height: hoehe + 1, segments: resolution  });
    return subtract(union(outer, stepOuter, stepInner), inner);
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

  return rotate([2 * Math.PI, 0, 0],tStueck);
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
  const rohrbogen = union(schenkel1, bogenPositioniert, schenkel2);

  return rohrbogen;
}





async function exportSTL(fileName, demoName, model) {
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

    window.api.getSaveFolder().then((saveFolderPath) => {
      const outputPath = `${saveFolderPath}/${fileName}.stl`;
      const demoOutputPath = `${saveFolderPath}/demo/${demoName}.stl`;

      // Save the file using the API
      window.api.saveSTL(demoOutputPath, finalBuffer).then(() => {
        console.log("✅ Demo STL file saved at:", demoOutputPath);
      });

      window.api.saveSTL(outputPath, finalBuffer).then(() => {
        console.log("✅ Output STL file saved at:", outputPath);
      });
    });

}



// Funktion, um einen Ring zu erstellen
export async function createSTL(bauteil) {
    let model;
    switch(bauteil.name){
        case 'Aussenring1':
            model = createAussenring1(bauteil.inputs);
            
            break;
        case 'Aussenring2':
            model = createAussenring2(bauteil.inputs);
            
            break;
        case 'Innenring1':
            model = createInnenring1(bauteil.inputs);
            
            break;
        case 'Innenring2':
            model = createInnenring2(bauteil.inputs);
            
            break;
        case 'T-Stueck':
            model = createTstueck(bauteil.inputs);
            break;
        case "Rohrbogen":
            model = createRohrbogen(bauteil.inputs);
            break;

    }



    if(model){
        await exportSTL(bauteil.stlName, bauteil.name, model);
    
    }

    console.log(`STL-Datei erfolgreich erstellt: `);
}
