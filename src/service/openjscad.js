import { roundedCylinder } from '@jscad/modeling/src/primitives';
import { height } from '@mui/system';

// Import der JSCAD-Bibliotheken
const { cylinder, cuboid, cylinderElliptic } = require('@jscad/modeling').primitives;
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
    }

    if(model){
        await exportSTL(bauteil.name, model);
    
    }

    console.log(`STL-Datei erfolgreich erstellt: `);
}
