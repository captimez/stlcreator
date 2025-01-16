import { extrudeRotate } from '@jscad/modeling/src/operations/extrusions';
import { center } from '@jscad/modeling/src/operations/transforms';
import { ellipse, roundedCylinder } from '@jscad/modeling/src/primitives';
import { height } from '@mui/system';

// Import der JSCAD-Bibliotheken
const { cylinder, cuboid, cylinderElliptic, torus } = require('@jscad/modeling').primitives;
const { subtract, union } = require('@jscad/modeling').booleans;
const { translate, rotate} = require('@jscad/modeling').transforms;
const { serialize } = require('@jscad/stl-serializer');

function createAussenring1({
    aussendurchmesser,
    innendurchmesser,
    hoehe,
    breite_aussen,
    breite_innen,
    tiefe_innen,
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
  
    // Umrechnen der Maße
    const Durchmesser_aussen = Number(aussendurchmesser) / 10;
    const Durchmesser_innen = Number(innendurchmesser) / 10;
    const Breite = Number(hoehe) / 10;
    const Breite_aussen = Number(breite_aussen) / 10;
    const Breite_innen = Number(breite_innen) / 10;
    const Tiefe_innen = Number(tiefe_innen) / 10;

    //Aussen Zylinder
    const aussen_zylinder = roundedCylinder({ radius: Durchmesser_aussen / 2, roundRadius: (Breite - Breite_aussen ) / 10 ,height: Breite});

    //Innen Zylinder 
    const innen_zylinder = cylinder({ radius: Durchmesser_innen/2 , height: Breite });

    //InnenLaufbahn Zylinder 
    const laufbahn = cylinder({ radius: (Durchmesser_innen / 2 ) + Tiefe_innen, height: Breite_innen });

    const mainRing = subtract(aussen_zylinder,innen_zylinder);

    return subtract(mainRing,laufbahn); 
  
    
  }

// Funktion für Außenring2
function createAussenring2({
    innendurchmesser_klein,
    innendurchmesser_gross,
    aussendurchmesser,
    hoehe,
  }) {
    // Parameterberechnung
    const D_aussen = Number(aussendurchmesser) / 10;
    const D_gr_innen = Number(innendurchmesser_gross) / 10;
    const D_kl_innen = Number(innendurchmesser_klein) / 10;

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
    const outer = cylinder({ radius: durchmesser_or / 2, height: hoehe });
    const stepOuter = cylinder({ radius: durchmesser_so / 2, height: hoehe_or });
    const stepInner = cylinder({ radius: durchmesser_su / 2, height: hoehe_ur });
    const inner = cylinder({ radius: durchmesser_ur / 2, height: hoehe + 1 });
    return subtract(union(outer, stepOuter, stepInner), inner);
}

// Funktion für Innenring2
function createInnenring2({ innendurchmesser, aussendurchmesser, hoehe, radius_ausstich }) {
    const outer = cylinder({ radius: aussendurchmesser / 2, height: hoehe });
    const inner = cylinder({ radius: innendurchmesser / 2, height: hoehe + 1 });
    const notch = cylinder({ radius: radius_ausstich, height: hoehe + 1 });
    return subtract(subtract(outer, inner), notch);
}

function createTstueck({
  zylinder_duchmesser_aussen,
  zylinder_duchmesser_innen,
  zylinder2_durchmesser_aussen,
  zylinder2_duchemsser_innen,
  laenge,
  hoehe,
}) {

  let zylinderBottomHeight = (hoehe + (zylinder_duchmesser_aussen / 2));

  // Top-Zylinder (horizontaler Zylinder)
  const topZylinderAussen = cylinder({ 
    radius: zylinder_duchmesser_aussen / 2, 
    height: laenge, 
    segments: 64
  });

  // Rotation um 90 Grad und Positionierung
  const topZylinder = translate(
    [0, 0, hoehe / 2], // Verschiebe den Zylinder zur Mitte des vertikalen Zylinders
    rotate([Math.PI / 2, 0, 0], topZylinderAussen) // Rotation um die X-Achse
  );

  // Bottom-Zylinder (vertikaler Zylinder)
  const bottomZylinder = cylinder({ 
    radius: zylinder2_durchmesser_aussen / 2, 
    height: zylinderBottomHeight, 
    segments: 64
  });

  // Innerer Hohlraum (falls benötigt)
  const innerTopZylinder = translate(
    [0, 0, hoehe / 2],
    rotate([Math.PI / 2, 0, 0], cylinder({
      radius: zylinder_duchmesser_innen / 2,
      height: laenge,
      segments: 64
    }))
  );

  const innerBottomZylinder = cylinder({
    radius: zylinder2_duchemsser_innen / 2,
    height: zylinderBottomHeight,
    segments: 64
  });

  // Außenkörper: Vereinigung von Top- und Bottom-Zylinder
  const tStueckAussen = union(topZylinder, bottomZylinder);

  // Innerer Hohlraum: Subtrahiere die inneren Zylinder
  const tStueck = subtract(tStueckAussen, innerTopZylinder, innerBottomZylinder);

  return rotate([2 * Math.PI, 0, 0],tStueck);
}

function createRohrbogen({
  durchmesser,
  winkel,             // Winkel in Grad
  schenkel_laenge_1,  // Länge des ersten Zylinders
  schenkel_laenge_2,  // Länge des zweiten Zylinders
}) {
  const radius = durchmesser / 2; // Außenradius des Rohres
  const winkelInRad = (winkel * Math.PI) / 180; // Grad in Radiant umrechnen

  const abstand = radius


  // Zylinder 1: Horizontal
  let schenkel1 = cylinder({ radius, height: schenkel_laenge_1, segments: 64 });
  schenkel1 = rotate([Math.PI / 2, 0, 0], schenkel1); // Um X-Achse rotieren
  schenkel1 = translate([0, (schenkel_laenge_1 / 2), 0], schenkel1);   // Positionieren

  // Zylinder 2: Schräg mit korrektem Winkel
  let schenkel2 = cylinder({ radius, height: schenkel_laenge_2, segments: 64 });
  schenkel2 = rotate([0, 0, -winkelInRad], schenkel2); // Zylinder rotieren
  schenkel2 = translate([0,schenkel_laenge_1 + radius + abstand ,(schenkel_laenge_2 / 2 )+ radius + abstand], schenkel2);

  // Bogen erstellen: Verbinden der beiden Zylinder
  let kreis = ellipse({ radius: [radius, radius], center:[abstand * 2, 0], segments: 64}); // Querschnitt des Rohres
  const bogen = extrudeRotate(
    { segments: 64, startAngle: 0, angle: winkelInRad }, // Start und Bogenwinkel
    kreis
  );

  // Bogen positionieren
  const bogenPositioniert = translate([0, schenkel_laenge_1, radius + abstand], rotate([0, Math.PI / 2, 0], bogen));

  // Zylinder und Bogen zusammenführen
  const winkelObject = union(schenkel1, bogenPositioniert, schenkel2);

  return winkelObject;
}

function createRohrbogen2({
  durchmesser,
  winkel,             // Winkel in Grad
  schenkel_laenge_1,  // Länge des ersten Zylinders
  schenkel_laenge_2,  // Länge des zweiten Zylinders
}) {
  const radius = durchmesser / 2; // Außenradius des Rohres
  const winkelInRad = (winkel * Math.PI) / 180; // Winkel in Radiant umrechnen

  // **Zylinder 1 (horizontaler Schenkel)**
  let schenkel1 = cylinder({ radius, height: schenkel_laenge_1, segments: 64 });
  schenkel1 = rotate([Math.PI / 2, 0, 0], schenkel1);
  schenkel1 = translate([0, schenkel_laenge_1 / 2, 0], schenkel1); // Positionieren

  // **Zylinder 2 (vertikaler Schenkel)**
  let schenkel2 = cylinder({ radius, height: schenkel_laenge_2, segments: 64 });

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
   let kreis = ellipse({ radius: [radius, radius], center:[radius + radius, 0], segments: 64}); // Querschnitt des Rohres
   const bogen = extrudeRotate(
     { segments: 64, startAngle: 0, angle: winkelInRad }, // Start und Bogenwinkel
     kreis
   );
 
   // Bogen positionieren
   const bogenPositioniert = translate([0, schenkel_laenge_1, radius + radius], rotate([0, Math.PI / 2, 0], bogen));


  // Wende die Verschiebung und Rotation auf Zylinder 2 an
  schenkel2 = rotate([winkelInRad, 0, 0], schenkel2); // Rotation um die X-Achse
  schenkel2 = rotate([Math.PI / 2, 0, 0], schenkel2);
  schenkel2 = translate([verschiebung.x, verschiebung.y, verschiebung.z], schenkel2);

  // **Zusammenfügen**
  const rohrbogen = union(schenkel1, bogenPositioniert, schenkel2);

  return rohrbogen;
}





async function exportSTL(fileName, model) {
    const stlData = serialize({ binary: false }, model);
    const outputPath = `./output/${fileName}.stl`;

    await window.api.saveSTL(outputPath,stlData[0]);
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
            model = createRohrbogen2(bauteil.inputs);
            break;

    }

    if(model){
        await exportSTL(bauteil.name, model);
    
    }

    console.log(`STL-Datei erfolgreich erstellt: `);
}
