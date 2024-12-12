// Import der JSCAD-Bibliotheken
const { cylinder, cuboid, cylinderElliptic } = require('@jscad/modeling').primitives;
const { subtract, union } = require('@jscad/modeling').booleans;
const { translate, rotate} = require('@jscad/modeling').transforms;
const { serialize } = require('@jscad/stl-serializer');

function createAussenring1(inputs) {

    console.log(inputs)
    
    // Inputs sicherstellen, dass sie Zahlen sind
    let Durchmesser_aussen = Number(inputs.aussendurchmesser);
    let Durchmesser_Schulter = Number(inputs.innendurchmesser);
    let Breite = Number(inputs.hoehe);
    let Durchmesser_Laufbahn = Number(inputs.breite_aussen);
    let Breite_Laufbahn = Number(inputs.breite_innen);


    console.log('Eingabeparameter:');
    console.log('Durchmesser_aussen:', Durchmesser_aussen);
    console.log('Durchmesser_Schulter:', Durchmesser_Schulter);
    console.log('Breite:', Breite);
    console.log('Durchmesser_Laufbahn:', Durchmesser_Laufbahn);
    console.log('Breite_Laufbahn:', Breite_Laufbahn);
  
    // Parameter berechnen
    const R_aussen = Durchmesser_aussen / 2;
    const R_innen = Durchmesser_Schulter / 2;
    const rak = (Breite - (Breite - 2)) / 2;

    console.log("R_aussen: ", R_aussen);
    console.log("R_innen: ", R_innen);
    console.log("rak: ", rak);
  
    // Zylinder für den äußeren Ring
    const outerCylinder = cylinder({ height: Breite - 2 * rak, radius: R_aussen });
  
    // Innerer Zylinder
    const innerCylinder = cylinder({ height: Breite, radius: R_innen });
  
    // Ausstich-Zylinder
    const ausstichRadius = (Durchmesser_Laufbahn - Durchmesser_Schulter) / 2 + R_innen;
    const ausstich = translate(
      [0, 0, ((Breite - 2) - Breite_Laufbahn) / 2],
      cylinder({ height: Breite_Laufbahn, radius: ausstichRadius })
    );
  
    // Unterschied der Hauptzylinder
    const mainDifference = subtract(outerCylinder, innerCylinder, ausstich);
  
    // Konus oben
    const topCone = translate(
      [0, 0, Breite - rak],
      subtract(
        cylinderElliptic({ height: rak, startRadius: [R_aussen, R_aussen], endRadius: [R_aussen - rak, R_aussen - rak] }),
        cylinder({ height: rak, radius: R_innen })
      )
    );
  
    // Konus unten
    const bottomCone = subtract(
      cylinderElliptic({ height: rak, startRadius: [R_aussen, R_aussen], endRadius: [R_aussen - rak, R_aussen - rak] }),
      cylinder({ height: rak, radius: R_innen })
    );
  
    // Rotieren und Zusammenfügen
    return rotate([0, 90, 0], translate([0, 0, rak], subtract(mainDifference, topCone, bottomCone)));
  }

// Funktion für Außenring2
function createAussenring2({ innendurchmesser_klein, innendurchmesser_gross, aussendurchmesser, hoehe }) {
    const outer = cylinder({ radius: aussendurchmesser / 2, height: hoehe });
    const innerSmall = cylinder({ radius: innendurchmesser_klein / 2, height: hoehe + 1 });
    const innerLarge = cylinder({ radius: innendurchmesser_gross / 2, height: hoehe + 1 });
    return subtract(outer, union(innerSmall, innerLarge));
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
