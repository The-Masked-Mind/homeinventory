const SUPABASE_URL = "https://fmsdrfeyjdgdjmnydgdg.supabase.co";
const SUPABASE_KEY = "sb_publishable_H8Q6dYQF5N6X1n-O9KH3Qg_4VmBViNN";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const manageButton =
    document.getElementById("manageButton");

const manageArea =
    document.getElementById("manageArea");

const manageContent =
    document.getElementById("manageContent");

const closeManage =
    document.getElementById("closeManage");
    
const stockButton =
    document.getElementById("stockButton");

const stockArea =
    document.getElementById("stockArea");

const stockContent =
    document.getElementById("stockContent");

const closeStock =
    document.getElementById("closeStock");

const shoppingListButton =
    document.getElementById("shoppingListButton");

const shoppingListArea =
    document.getElementById("shoppingListArea");

const shoppingListContent =
    document.getElementById("shoppingListContent");

const closeShoppingList =
    document.getElementById("closeShoppingList");
    
const scanButton = document.getElementById("scanButton");
const closeScannerButton = document.getElementById("closeScanner");
const scannerArea = document.getElementById("scannerArea");
const scanResult = document.getElementById("scanResult");
const manualBarcode = document.getElementById("manualBarcode");
const manualSearchButton = document.getElementById("manualSearchButton");

let scanner = null;
let letzterBarcode = null;

scanButton.addEventListener("click", async () => {

    await alleBereicheSchliessen();

    startScanner();
});

manualSearchButton.addEventListener("click", async () => {

    const barcode = manualBarcode.value.trim();

    if (!barcode) {
        alert("Bitte einen Barcode eingeben.");
        return;
    }

    if (!/^\d+$/.test(barcode)) {
        alert("Der Barcode darf nur Zahlen enthalten.");
        return;
    }

    scanResult.innerHTML = `
        <strong>Barcode eingegeben</strong>
        <br><br>
        ${barcode}
        <br><br>
        Produkt wird gesucht...
    `;

    await produktSuchen(barcode);
});

shoppingListButton.addEventListener("click", async () => {

    await alleBereicheSchliessen();

    await einkaufslisteAnzeigen();

    shoppingListArea.classList.remove("hidden");
});

stockButton.addEventListener("click", async () => {

    await alleBereicheSchliessen();

    await bestandAnzeigen();

    stockArea.classList.remove("hidden");
});

manageButton.addEventListener("click", async () => {

    await alleBereicheSchliessen();

    await artikelverwaltungAnzeigen();

    manageArea.classList.remove("hidden");
});

async function artikelverwaltungAnzeigen() {

    const { data: artikel, error } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .order("name", { ascending: true });

    if (error) {
        console.error(
            "Fehler beim Laden der Artikelverwaltung:",
            error
        );

        manageContent.innerHTML = `
            <p>
                Artikel konnten nicht geladen werden.
            </p>
        `;

        return;
    }

    if (!artikel || artikel.length === 0) {

        manageContent.innerHTML = `
            <p>
                Noch keine Artikel gespeichert.
            </p>
        `;

        return;
    }

    manageContent.innerHTML =
        artikel.map(produkt => {

            return `
                <div class="manage-item">

                    <div>
                        <strong>
                            ${produkt.name}
                        </strong>

                        <small>
                            Barcode:
                            ${produkt.barcode}
                        </small>
                    </div>

                    <button
                        class="editButton"
                        data-barcode="${produkt.barcode}"
                    >
                        Bearbeiten
                    </button>

                </div>
            `;

        }).join("");

    document
        .querySelectorAll(".editButton")
        .forEach(button => {

            button.addEventListener("click", () => {

                artikelBearbeiten(
                    button.dataset.barcode
                );

            });

        });
}

async function artikelBearbeiten(barcode) {

    const { data: treffer, error } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq("barcode", barcode)
            .limit(1);

    if (error) {
        console.error(
            "Fehler beim Laden des Artikels:",
            error
        );
        return;
    }

    if (!treffer || treffer.length === 0) {
        alert("Artikel wurde nicht gefunden.");
        return;
    }

    const produkt = treffer[0];

    manageContent.innerHTML = `
        <div class="artikel-formular">

            <h3>Artikel bearbeiten</h3>

            <label>Produktname</label>

            <input
                id="editName"
                type="text"
                value="${produkt.name}"
            >

            <label>Marke</label>

            <input
                id="editMarke"
                type="text"
                value="${produkt.marke || ""}"
            >

            <label>Kategorie</label>

            <select id="editKategorie">

                <option value="Kühlschrank">
                    Kühlschrank
                </option>

                <option value="Vorrat">
                    Vorratsschrank
                </option>

                <option value="Getränke">
                    Getränke
                </option>

                <option value="Gefrierschrank">
                    Gefrierschrank
                </option>

                <option value="Sonstiges">
                    Sonstiges
                </option>

            </select>

            <label>Einheit</label>

            <select id="editEinheit">

                <option value="Stück">Stück</option>
                <option value="Packung">Packung</option>
                <option value="Flasche">Flasche</option>
                <option value="Glas">Glas</option>
                <option value="Dose">Dose</option>

            </select>

            <label>Aktueller Bestand</label>

            <input
                id="editBestand"
                type="number"
                min="0"
                value="${produkt.bestand}"
            >

            <label>Mindestbestand</label>

            <input
                id="editMindestbestand"
                type="number"
                min="0"
                value="${produkt.mindestbestand}"
            >

            <label>Sollbestand</label>

            <input
                id="editSollbestand"
                type="number"
                min="0"
                value="${produkt.sollbestand}"
            >

            <button id="saveEditButton">
                Änderungen speichern
            </button>

            <button id="deleteArticleButton">
                Artikel löschen
            </button>

            <button id="cancelEditButton">
                Zurück
            </button>

        </div>
    `;

    document.getElementById("editKategorie").value =
        produkt.kategorie;

    document.getElementById("editEinheit").value =
        produkt.einheit;

    document
        .getElementById("saveEditButton")
        .addEventListener("click", () => {

            artikelAenderungenSpeichern(barcode);

        });

    document
        .getElementById("deleteArticleButton")
        .addEventListener("click", () => {

            artikelLoeschen(barcode);

        });

    document
        .getElementById("cancelEditButton")
        .addEventListener("click", () => {

            artikelverwaltungAnzeigen();

        });
}

async function alleBereicheSchliessen() {

    // Falls Scanner läuft: Kamera wirklich ausschalten
    if (scanner) {

        try {
            await scanner.stop();
            scanner.clear();
        } catch (error) {
            console.error("Scanner konnte nicht beendet werden:", error);
        }

        scanner = null;
        letzterBarcode = null;
    }

    scannerArea.classList.add("hidden");
    shoppingListArea.classList.add("hidden");
    stockArea.classList.add("hidden");
    manageArea.classList.add("hidden");
} 

async function artikelAenderungenSpeichern(barcode) {

    const aenderungen = {

        name:
            document.getElementById("editName").value.trim(),

        marke:
            document.getElementById("editMarke").value.trim(),

        kategorie:
            document.getElementById("editKategorie").value,

        einheit:
            document.getElementById("editEinheit").value,

        bestand:
            Number(
                document.getElementById("editBestand").value
            ),

        mindestbestand:
            Number(
                document.getElementById("editMindestbestand").value
            ),

        sollbestand:
            Number(
                document.getElementById("editSollbestand").value
            )
    };

    if (!aenderungen.name) {
        alert("Bitte einen Produktnamen eingeben.");
        return;
    }

    const { error } =
        await supabaseClient
            .from("artikel")
            .update(aenderungen)
            .eq("barcode", barcode);

    if (error) {

        console.error(
            "Fehler beim Speichern:",
            error
        );

        alert("Änderungen konnten nicht gespeichert werden.");
        return;
    }

    artikelverwaltungAnzeigen();
}

async function artikelLoeschen(barcode) {

    const bestaetigt =
        confirm(
            "Soll dieser Artikel wirklich gelöscht werden?"
        );

    if (!bestaetigt) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("artikel")
            .delete()
            .eq("barcode", barcode);

    if (error) {

        console.error(
            "Fehler beim Löschen:",
            error
        );

        alert("Artikel konnte nicht gelöscht werden.");
        return;
    }

    artikelverwaltungAnzeigen();
}

async function bestandAnzeigen() {

    const { data: artikel, error } =
        await supabaseClient
            .from("artikel")
            .select("*");

    if (error) {

        console.error(
            "Fehler beim Laden des Bestands:",
            error
        );

        stockContent.innerHTML = `
            <p>
                Bestand konnte nicht geladen werden.
            </p>
        `;

        return;
    }

    if (!artikel || artikel.length === 0) {

        stockContent.innerHTML = `
            <p>
                Noch keine Artikel gespeichert.
            </p>
        `;

        return;
    }

    const kategorien = {};

    artikel.forEach(produkt => {

        const kategorie =
            produkt.kategorie || "Sonstiges";

        if (!kategorien[kategorie]) {
            kategorien[kategorie] = [];
        }

        kategorien[kategorie].push(produkt);

    });

    let html = "";

    Object.keys(kategorien)
        .sort()
        .forEach(kategorie => {

            html += `
                <div class="stock-category">

                    <h3>
                        ${kategorie}
                    </h3>
            `;

            kategorien[kategorie]
                .sort((a, b) =>
                    a.name.localeCompare(b.name)
                )
                .forEach(produkt => {

                    html += `
                        <div class="stock-item">

                            <strong>
                                ${produkt.name}
                            </strong>

                            <span>
                                ${produkt.bestand}
                                ${produkt.einheit}
                            </span>

                        </div>
                    `;

                });

            html += `
                </div>
            `;

        });

    stockContent.innerHTML = html;
}

async function einkaufslisteAnzeigen() {

    const { data: artikel, error } =
        await supabaseClient
            .from("artikel")
            .select("*");

    if (error) {
        console.error(
            "Fehler beim Laden der Einkaufsliste:",
            error
        );

        shoppingListContent.innerHTML = `
            <p>
                Einkaufsliste konnte nicht geladen werden.
            </p>
        `;

        return;
    }

    const einkaufsliste =
        artikel.filter(
            produkt =>
                produkt.bestand <= produkt.mindestbestand
        );

    if (einkaufsliste.length === 0) {

        shoppingListContent.innerHTML = `
            <p>
                Aktuell muss nichts nachgekauft werden. ✓
            </p>
        `;

        return;
    }

    shoppingListContent.innerHTML =
        einkaufsliste.map(produkt => {

            const kaufmenge =
                Math.max(
                    produkt.sollbestand - produkt.bestand,
                    0
                );

            return `
                <div class="shopping-item">

                    <strong>
                        ${produkt.name}
                    </strong>

                    <span>
                        ${kaufmenge}
                        ${produkt.einheit}
                        kaufen
                    </span>

                    <small>
                        Bestand:
                        ${produkt.bestand}
                    </small>

                </div>
            `;

        }).join("");
}

function startScanner() {
    scannerArea.classList.remove("hidden");

    scanner = new Html5Qrcode("reader");

    const config = {
        fps: 10,
        qrbox: {
            width: 280,
            height: 140
        },
        formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128
        ]
    };

    scanner.start(
        { facingMode: "environment" },
        config,
        barcodeErkannt,
        scanFehler
    ).catch(error => {
        console.error(error);
        scanResult.innerHTML = "Kamera konnte nicht gestartet werden.";
    });
}

async function barcodeErkannt(barcode) {
    if (barcode === letzterBarcode) {
        return;
    }

    letzterBarcode = barcode;

    scanResult.innerHTML = `
        <strong>Barcode erkannt</strong>
        <br><br>
        ${barcode}
        <br><br>
        Produkt wird gesucht...
    `;

    await produktSuchen(barcode);
}

function scanFehler(error) {
    // Scanner sucht einfach weiter
}

async function produktSuchen(barcode) {

    // 1. Erst in unserer Supabase-Datenbank suchen
    const { data: gespeicherteArtikel, error: suchFehler } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq("barcode", barcode)
            .limit(1);

    if (suchFehler) {
        console.error("Fehler beim Suchen in Supabase:", suchFehler);
    }

    if (
        gespeicherteArtikel &&
        gespeicherteArtikel.length > 0
    ) {
        gespeichertenArtikelAnzeigen(
            gespeicherteArtikel[0]
        );
        return;
    }

    // 2. Wenn nicht vorhanden:
    // Open Food Facts fragen
    try {

        const url =
            `https://world.openfoodfacts.org/api/v2/product/${barcode}.json` +
            `?fields=product_name,brands,image_front_url`;

        const response = await fetch(url);
        const daten = await response.json();

        if (daten.status === 1 && daten.product) {

            const produkt = daten.product;

            const name =
                produkt.product_name || "Unbekannter Artikel";

            const marke =
                produkt.brands || "";

            artikelFormularAnzeigen(
                barcode,
                name,
                marke,
                true
            );

        } else {

            artikelFormularAnzeigen(
                barcode,
                "",
                "",
                false
            );

        }

    } catch (error) {

        console.error(error);

        scanResult.innerHTML = `
            Produktdaten konnten nicht geladen werden.
            <br><br>
            Barcode: ${barcode}
        `;

    }
}

function artikelFormularAnzeigen(barcode, name, marke, gefunden) {
    scanResult.innerHTML = `
        <div class="artikel-formular">

            <h3>
                ${gefunden ? "Produkt gefunden" : "Neuer Artikel"}
            </h3>

            <label>Barcode</label>
            <input
                type="text"
                value="${barcode}"
                readonly
            >

            <label>Produktname</label>
            <input
                type="text"
                id="produktName"
                value="${name}"
                placeholder="Produktname eingeben"
            >

            <label>Marke</label>
            <input
                type="text"
                id="produktMarke"
                value="${marke}"
                placeholder="Marke"
            >

            <label>Kategorie</label>
            <select id="produktKategorie">
                <option value="Kühlschrank">
                    Kühlschrank
                </option>

                <option value="Vorrat">
                    Vorratsschrank
                </option>

                <option value="Getränke">
                    Getränke
                </option>

                <option value="Gefrierschrank">
                    Gefrierschrank
                </option>

                <option value="Sonstiges">
                    Sonstiges
                </option>
            </select>

            <label>Einheit</label>
            <select id="produktEinheit">
                <option value="Stück">Stück</option>
                <option value="Packung">Packung</option>
                <option value="Flasche">Flasche</option>
                <option value="Glas">Glas</option>
                <option value="Dose">Dose</option>
            </select>

            <label>Mindestbestand</label>
            <input
                type="number"
                id="mindestbestand"
                value="1"
                min="0"
            >

            <label>Sollbestand</label>
            <input
                type="number"
                id="sollbestand"
                value="2"
                min="0"
            >

            <button id="artikelSpeichern">
                Artikel speichern
            </button>

        </div>
    `;

    document
        .getElementById("artikelSpeichern")
        .addEventListener("click", () => {
            artikelSpeichern(barcode);
        });
}

async function artikelSpeichern(barcode) {

    const artikel = {

        barcode: barcode,

        name:
            document.getElementById("produktName").value.trim(),

        marke:
            document.getElementById("produktMarke").value.trim(),

        kategorie:
            document.getElementById("produktKategorie").value,

        einheit:
            document.getElementById("produktEinheit").value,

        mindestbestand:
            Number(
                document.getElementById("mindestbestand").value
            ),

        sollbestand:
            Number(
                document.getElementById("sollbestand").value
            ),

        bestand: 0
    };

    if (!artikel.name) {
        alert("Bitte einen Produktnamen eingeben.");
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("artikel")
            .insert([artikel])
            .select();

    if (error) {

        console.error(
            "Fehler beim Speichern:",
            error
        );

        scanResult.innerHTML = `
            <strong>Fehler beim Speichern</strong>
            <br><br>
            ${error.message}
        `;

        return;
    }

    console.log(
        "Artikel in Supabase gespeichert:",
        data
    );

    scanResult.innerHTML = `
        <strong>Artikel gespeichert ✓</strong>

        <br><br>

        ${artikel.name}

        <br><br>

        Barcode:
        <br>
        ${artikel.barcode}
    `;
}

function gespeichertenArtikelAnzeigen(artikel) {

    scanResult.innerHTML = `
        <div class="artikel-formular">

            <h3>${artikel.name}</h3>

            <p>
                <strong>Marke:</strong>
                ${artikel.marke || "-"}
            </p>

            <p>
                <strong>Bestand:</strong>
                <span id="aktuellerBestand">
                    ${artikel.bestand}
                </span>
                ${artikel.einheit}
            </p>

            <p>
                <strong>Mindestbestand:</strong>
                ${artikel.mindestbestand}
            </p>

            <p>
                <strong>Sollbestand:</strong>
                ${artikel.sollbestand}
            </p>

            <div class="mengenwahl">

                <button id="mengeMinus">
                    −
                </button>

                <span id="mengeAnzeige">
                    1
                </span>

                <button id="mengePlus">
                    +
                </button>

            </div>

            <button id="artikelEntnehmen">
                Entnehmen
            </button>

            <button id="artikelEinlagern">
                Einlagern
            </button>

        </div>
    `;

    let menge = 1;

    const mengeAnzeige =
        document.getElementById("mengeAnzeige");

    document
        .getElementById("mengeMinus")
        .addEventListener("click", () => {

            if (menge > 1) {
                menge--;
                mengeAnzeige.textContent = menge;
            }

        });

    document
        .getElementById("mengePlus")
        .addEventListener("click", () => {

            menge++;
            mengeAnzeige.textContent = menge;

        });

    document
        .getElementById("artikelEntnehmen")
        .addEventListener("click", () => {

            bestandAendern(
                artikel.barcode,
                -menge
            );

        });

    document
        .getElementById("artikelEinlagern")
        .addEventListener("click", () => {

            bestandAendern(
                artikel.barcode,
                menge
            );

        });
}

async function bestandAendern(barcode, aenderung) {

    const { data: treffer, error: suchFehler } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq("barcode", barcode)
            .limit(1);

    if (suchFehler) {
        console.error("Fehler beim Laden:", suchFehler);
        return;
    }

    if (!treffer || treffer.length === 0) {
        alert("Artikel wurde nicht gefunden.");
        return;
    }

    const artikel = treffer[0];

    let neuerBestand =
        artikel.bestand + aenderung;

    if (neuerBestand < 0) {
        neuerBestand = 0;
    }

    const { error: updateFehler } =
        await supabaseClient
            .from("artikel")
            .update({
                bestand: neuerBestand
            })
            .eq("barcode", barcode);

    if (updateFehler) {
        console.error("Fehler beim Aktualisieren:", updateFehler);
        return;
    }

    artikel.bestand = neuerBestand;

    document
        .getElementById("aktuellerBestand")
        .textContent = neuerBestand;

    zeigeSpeicherMeldung();
}

function zeigeSpeicherMeldung() {

    let meldung = document.getElementById("speicherMeldung");

    if (!meldung) {
        meldung = document.createElement("div");
        meldung.id = "speicherMeldung";
        document
            .querySelector(".artikel-formular")
            .appendChild(meldung);
    }

    meldung.textContent = "Bestand aktualisiert ✓";
    meldung.classList.add("sichtbar");

    setTimeout(() => {
        meldung.classList.remove("sichtbar");
    }, 1800);
}

async function stopScanner() {
    if (scanner) {
        try {
            await scanner.stop();
            scanner.clear();
        } catch (error) {
            console.error(error);
        }
    }

    scanner = null;
    letzterBarcode = null;

    scannerArea.classList.add("hidden");
}
async function supabaseTest() {

    const { data, error } = await supabaseClient
        .from("artikel")
        .select("*");

    if (error) {
        console.error("Supabase Fehler:", error);
        return;
    }

    console.log("Supabase Verbindung funktioniert:", data);
}

supabaseTest();