/* =========================================================
   HOMEINVENTORY
   Login + Google + Haushalte + Bestand
========================================================= */


/* =========================================================
   ELEMENTE
========================================================= */

const showInviteCodeButton =
    document.getElementById("showInviteCodeButton");

const changeHouseholdButton =
    document.getElementById("changeHouseholdButton");

const inviteCodeDisplay =
    document.getElementById("inviteCodeDisplay");

const loggedInUser =
    document.getElementById("loggedInUser");

const currentHousehold =
    document.getElementById("currentHousehold");

const googleLoginButton =
    document.getElementById("googleLoginButton");

const householdArea =
    document.getElementById("householdArea");

const householdInfo =
    document.getElementById("householdInfo");

const householdName =
    document.getElementById("householdName");

const inviteCodeInput =
    document.getElementById("inviteCodeInput");

const createHouseholdButton =
    document.getElementById("createHouseholdButton");

const joinHouseholdButton =
    document.getElementById("joinHouseholdButton");

const householdLogoutButton =
    document.getElementById("householdLogoutButton");


const authArea =
    document.getElementById("authArea");

const appArea =
    document.getElementById("appArea");

const authEmail =
    document.getElementById("authEmail");

const authPassword =
    document.getElementById("authPassword");

const authInfo =
    document.getElementById("authInfo");

const loginButton =
    document.getElementById("loginButton");

const registerButton =
    document.getElementById("registerButton");

const logoutButton =
    document.getElementById("logoutButton");


const manageSearch =
    document.getElementById("manageSearch");

const stockSearch =
    document.getElementById("stockSearch");


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


const scanButton =
    document.getElementById("scanButton");

const closeScannerButton =
    document.getElementById("closeScanner");

const scannerArea =
    document.getElementById("scannerArea");

const scanResult =
    document.getElementById("scanResult");

const manualBarcode =
    document.getElementById("manualBarcode");

const manualSearchButton =
    document.getElementById("manualSearchButton");


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://fmsdrfeyjdgdjmnydgdg.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_H8Q6dYQF5N6X1n-O9KH3Qg_4VmBViNN";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   STATUS
========================================================= */

let scanner = null;

let letzterBarcode = null;

let aktuellerHaushaltId = null;

let aktuellerHaushalt = null;


/* =========================================================
   HILFSFUNKTIONEN
========================================================= */

function escapeHtml(wert) {

    return String(wert ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


async function alleBereicheSchliessen() {

    if (scanner) {

        try {

            await scanner.stop();

            scanner.clear();

        } catch (error) {

            console.error(
                "Scanner konnte nicht beendet werden:",
                error
            );
        }

        scanner = null;

        letzterBarcode = null;
    }


    if (scannerArea) {
        scannerArea.classList.add("hidden");
    }

    if (shoppingListArea) {
        shoppingListArea.classList.add("hidden");
    }

    if (stockArea) {
        stockArea.classList.add("hidden");
    }

    if (manageArea) {
        manageArea.classList.add("hidden");
    }
}


/* =========================================================
   SESSION PRÜFEN
========================================================= */

async function sessionPruefen() {

    const {
        data: { session }
    } =
        await supabaseClient.auth.getSession();


    if (session) {

        authArea.classList.add("hidden");

        householdArea.classList.add("hidden");

        appArea.classList.add("hidden");

        await haushaltPruefen();

    } else {

        aktuellerHaushaltId = null;

        aktuellerHaushalt = null;

        authArea.classList.remove("hidden");

        householdArea.classList.add("hidden");

        appArea.classList.add("hidden");
    }
}


/* =========================================================
   REGISTRIERUNG
========================================================= */

registerButton.addEventListener(
    "click",
    async () => {

        const email =
            authEmail.value.trim();

        const passwort =
            authPassword.value;


        if (!email || !passwort) {

            authInfo.textContent =
                "Bitte E-Mail und Passwort eingeben.";

            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email: email,

                password: passwort
            });


        if (error) {

            console.error(error);

            authInfo.textContent =
                "Registrierung fehlgeschlagen: " +
                error.message;

            return;
        }


        authInfo.textContent =
            "Konto erstellt ✓ Bitte bestätige jetzt deine E-Mail-Adresse.";


        console.log(
            "Registrierung:",
            data
        );
    }
);


/* =========================================================
   LOGIN MIT E-MAIL
========================================================= */

loginButton.addEventListener(
    "click",
    async () => {

        const email =
            authEmail.value.trim();

        const passwort =
            authPassword.value;


        if (!email || !passwort) {

            authInfo.textContent =
                "Bitte E-Mail und Passwort eingeben.";

            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: passwort
            });


        if (error) {

            console.error(error);


            if (
                error.message
                    .toLowerCase()
                    .includes("email not confirmed")
            ) {

                authInfo.textContent =
                    "Bitte bestätige zuerst deine E-Mail-Adresse.";

            } else {

                authInfo.textContent =
                    "Anmeldung fehlgeschlagen: " +
                    error.message;
            }

            return;
        }


        authInfo.textContent =
            "Anmeldung erfolgreich.";


        console.log(
            "Login:",
            data
        );


        await haushaltPruefen();
    }
);


/* =========================================================
   GOOGLE LOGIN
========================================================= */

if (googleLoginButton) {

    googleLoginButton.addEventListener(
        "click",
        async () => {

            const {
                error
            } =
                await supabaseClient.auth.signInWithOAuth({

                    provider: "google",

                    options: {

                        redirectTo:
                            "https://the-masked-mind.github.io/homeinventory/"
                    }
                });


            if (error) {

                console.error(
                    error
                );

                authInfo.textContent =
                    "Google-Anmeldung fehlgeschlagen.";
            }
        }
    );
}


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();


        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                error
            );

            return;
        }


        authEmail.value = "";

        authPassword.value = "";


        aktuellerHaushaltId = null;

        aktuellerHaushalt = null;


        authArea.classList.remove("hidden");

        householdArea.classList.add("hidden");

        appArea.classList.add("hidden");


        authInfo.textContent =
            "Du wurdest abgemeldet.";
    }
);


/* =========================================================
   EINLADUNGSCODE ERZEUGEN
========================================================= */

function einladungscodeErzeugen() {

    const zeichen =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code =
        "";


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        code += zeichen.charAt(

            Math.floor(

                Math.random() *
                zeichen.length
            )
        );
    }


    return code;
}


/* =========================================================
   HAUSHALT PRÜFEN
========================================================= */

async function haushaltPruefen() {

    const {
        data: { user },
        error: userFehler
    } =
        await supabaseClient.auth.getUser();


    if (userFehler) {

        console.error(
            "Benutzer konnte nicht geladen werden:",
            userFehler
        );
    }


    if (!user) {

        aktuellerHaushaltId = null;

        aktuellerHaushalt = null;


        authArea.classList.remove("hidden");

        householdArea.classList.add("hidden");

        appArea.classList.add("hidden");


        return;
    }


    const {
        data: mitgliedschaften,
        error
    } =
        await supabaseClient
            .from("household_members")
            .select(`
                household_id,
                role,
                households (
                    id,
                    name,
                    invite_code
                )
            `)
            .eq(
                "user_id",
                user.id
            );


    if (error) {

        console.error(
            "Fehler beim Laden des Haushalts:",
            error
        );


        authArea.classList.add("hidden");

        householdArea.classList.remove("hidden");

        appArea.classList.add("hidden");


        householdInfo.textContent =
            "Haushalt konnte nicht geladen werden.";


        return;
    }


    if (
        !mitgliedschaften ||
        mitgliedschaften.length === 0
    ) {

        aktuellerHaushaltId = null;

        aktuellerHaushalt = null;


        authArea.classList.add("hidden");

        householdArea.classList.remove("hidden");

        appArea.classList.add("hidden");


        householdInfo.textContent =
            "Erstelle einen neuen Haushalt oder tritt einem bestehenden bei.";


        return;
    }


    const mitgliedschaft =
        mitgliedschaften[0];


    aktuellerHaushaltId =
        mitgliedschaft.household_id;


    aktuellerHaushalt =
        mitgliedschaft.households;


    authArea.classList.add("hidden");

    householdArea.classList.add("hidden");

    appArea.classList.remove("hidden");


    console.log(
        "Aktueller Haushalt:",
        aktuellerHaushalt
    );
}

if (loggedInUser) {

    loggedInUser.textContent =
        user.email || "Unbekannter Benutzer";
}

if (currentHousehold) {

    currentHousehold.textContent =
        aktuellerHaushalt?.name ||
        "Kein Haushalt";
}


/* =========================================================
   HAUSHALT ERSTELLEN
========================================================= */

/* =========================================================
   HAUSHALT ERSTELLEN
========================================================= */

createHouseholdButton.addEventListener(
    "click",
    async () => {

        const name =
            householdName.value.trim();


        if (!name) {

            householdInfo.textContent =
                "Bitte einen Namen für den Haushalt eingeben.";

            return;
        }


        householdInfo.textContent =
            "Haushalt wird erstellt...";


        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "create_household",
                {
                    p_name: name
                }
            );


        if (error) {

            console.error(
                "Haushalt konnte nicht erstellt werden:",
                error
            );


            householdInfo.textContent =
                "Haushalt konnte nicht erstellt werden: " +
                error.message;


            return;
        }


        console.log(
            "Haushalt erstellt:",
            data
        );


        householdName.value =
            "";


        householdInfo.textContent =
            "Haushalt erstellt ✓";


        await haushaltPruefen();
    }
);


/* =========================================================
   HAUSHALT BEITRETEN
========================================================= */

joinHouseholdButton.addEventListener(
    "click",
    async () => {

        const code =
            inviteCodeInput.value
                .trim()
                .toUpperCase();


        if (!code) {

            householdInfo.textContent =
                "Bitte einen Einladungscode eingeben.";

            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "join_household_by_code",
                    {
                        p_invite_code:
                            code
                    }
                );


        if (error) {

            console.error(
                "Beitritt fehlgeschlagen:",
                error
            );


            householdInfo.textContent =
                "Einladungscode ungültig oder Haushalt nicht gefunden.";


            return;
        }


        aktuellerHaushaltId =
            data;


        inviteCodeInput.value =
            "";


        householdInfo.textContent =
            "Haushalt erfolgreich beigetreten ✓";


        await haushaltPruefen();
    }
);


/* =========================================================
   LOGOUT AUF HAUSHALTSSEITE
========================================================= */

householdLogoutButton.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();


        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                error
            );

            return;
        }


        aktuellerHaushaltId = null;

        aktuellerHaushalt = null;


        householdName.value = "";

        inviteCodeInput.value = "";


        householdArea.classList.add("hidden");

        appArea.classList.add("hidden");

        authArea.classList.remove("hidden");


        authInfo.textContent =
            "Du wurdest abgemeldet.";
    }
);


/* =========================================================
   HAUPTNAVIGATION
========================================================= */

scanButton.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();

        startScanner();
    }
);


closeScannerButton.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();
    }
);


shoppingListButton.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();


        shoppingListArea
            .classList
            .remove("hidden");


        await einkaufslisteAnzeigen();
    }
);


closeShoppingList.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();
    }
);


stockButton.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();


        stockArea
            .classList
            .remove("hidden");


        await bestandAnzeigen(

            stockSearch
                ? stockSearch.value
                : ""
        );
    }
);


closeStock.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();
    }
);


manageButton.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();


        manageArea
            .classList
            .remove("hidden");


        await artikelverwaltungAnzeigen(

            manageSearch
                ? manageSearch.value
                : ""
        );
    }
);


closeManage.addEventListener(
    "click",
    async () => {

        await alleBereicheSchliessen();
    }
);


/* =========================================================
   SUCHFELDER
========================================================= */

if (stockSearch) {

    stockSearch.addEventListener(
        "input",
        () => {

            bestandAnzeigen(
                stockSearch.value
            );
        }
    );
}


if (manageSearch) {

    manageSearch.addEventListener(
        "input",
        () => {

            artikelverwaltungAnzeigen(
                manageSearch.value
            );
        }
    );
}

/* =========================================================
   MANUELLE BARCODE-EINGABE
========================================================= */

manualSearchButton.addEventListener(
    "click",
    async () => {

        const barcode =
            manualBarcode.value.trim();


        if (!barcode) {

            alert(
                "Bitte einen Barcode eingeben."
            );

            return;
        }


        if (!/^\d+$/.test(barcode)) {

            alert(
                "Der Barcode darf nur Zahlen enthalten."
            );

            return;
        }


        scanResult.innerHTML = `
            <strong>
                Barcode eingegeben
            </strong>

            <br><br>

            ${escapeHtml(barcode)}

            <br><br>

            Produkt wird gesucht...
        `;


        letzterBarcode =
            barcode;


        await produktSuchen(
            barcode
        );
    }
);


/* =========================================================
   SCANNER
========================================================= */

function startScanner() {

    scannerArea
        .classList
        .remove("hidden");


    if (scanner) {

        return;
    }


    scanner =
        new Html5Qrcode(
            "reader"
        );


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

        {
            facingMode:
                "environment"
        },

        config,

        barcodeErkannt,

        scanFehler

    ).catch(
        error => {

            console.error(
                error
            );


            scanner =
                null;


            scanResult.innerHTML =
                "Kamera konnte nicht gestartet werden.";
        }
    );
}


async function barcodeErkannt(
    barcode
) {

    if (
        barcode ===
        letzterBarcode
    ) {

        return;
    }


    letzterBarcode =
        barcode;


    scanResult.innerHTML = `
        <strong>
            Barcode erkannt
        </strong>

        <br><br>

        ${escapeHtml(barcode)}

        <br><br>

        Produkt wird gesucht...
    `;


    await produktSuchen(
        barcode
    );
}


function scanFehler(
    error
) {
}


/* =========================================================
   PRODUKT SUCHEN
========================================================= */

async function produktSuchen(
    barcode
) {

    if (!aktuellerHaushaltId) {

        scanResult.innerHTML = `
            <strong>
                Kein Haushalt ausgewählt.
            </strong>
        `;

        return;
    }


    const {
        data: gespeicherteArtikel,
        error: suchFehler
    } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq(
                "barcode",
                barcode
            )
            .eq(
                "household_id",
                aktuellerHaushaltId
            )
            .limit(1);


    if (suchFehler) {

        console.error(
            "Fehler beim Suchen in Supabase:",
            suchFehler
        );


        scanResult.innerHTML = `
            <strong>
                Fehler bei der Datenbanksuche
            </strong>

            <br><br>

            Bitte später erneut versuchen.
        `;


        return;
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


    try {

        const url =
            `https://world.openfoodfacts.org/api/v2/product/${barcode}.json` +
            `?fields=product_name,product_name_de,brands,image_front_url`;


        const response =
            await fetch(
                url
            );


        if (!response.ok) {

            throw new Error(
                `Open Food Facts HTTP ${response.status}`
            );
        }


        const daten =
            await response.json();


        if (
            daten.status === 1 &&
            daten.product
        ) {

            const produkt =
                daten.product;


            const name =
                produkt.product_name_de ||
                produkt.product_name ||
                "";


            const marke =
                produkt.brands ||
                "";


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

        console.error(
            error
        );


        artikelFormularAnzeigen(
            barcode,
            "",
            "",
            false
        );
    }
}


/* =========================================================
   ARTIKELFORMULAR
========================================================= */

function artikelFormularAnzeigen(
    barcode,
    name,
    marke,
    gefunden
) {

    scanResult.innerHTML = `
        <div class="artikel-formular">

            <h3>
                ${
                    gefunden
                        ? "Produkt gefunden"
                        : "Neuer Artikel"
                }
            </h3>

            <label>
                Barcode
            </label>

            <input
                type="text"
                value="${escapeHtml(barcode)}"
                readonly
            >


            <label>
                Produktname
            </label>

            <input
                type="text"
                id="produktName"
                value="${escapeHtml(name)}"
                placeholder="Produktname eingeben"
            >


            <label>
                Marke
            </label>

            <input
                type="text"
                id="produktMarke"
                value="${escapeHtml(marke)}"
                placeholder="Marke"
            >


            <label>
                Kategorie
            </label>

            <input
                type="text"
                id="produktKategorie"
                placeholder="Kategorie eingeben"
                autocomplete="off"
            >


            <label>
                Einheit
            </label>

            <select
                id="produktEinheit"
            >

                <option value="Stück">
                    Stück
                </option>

                <option value="Packung">
                    Packung
                </option>

                <option value="Flasche">
                    Flasche
                </option>

                <option value="Glas">
                    Glas
                </option>

                <option value="Dose">
                    Dose
                </option>

            </select>


            <label>
                Wie viel davon hast du?
            </label>

            <input
                type="number"
                id="produktBestand"
                value="1"
                min="0"
            >


            <label>
                Mindestbestand
            </label>

            <input
                type="number"
                id="mindestbestand"
                value="1"
                min="0"
            >


            <label>
                Sollbestand
            </label>

            <input
                type="number"
                id="sollbestand"
                value="2"
                min="0"
            >


            <button
                id="artikelSpeichern"
            >
                Artikel speichern
            </button>

        </div>
    `;


    document
        .getElementById(
            "artikelSpeichern"
        )
        .addEventListener(
            "click",
            () => {

                artikelSpeichern(
                    barcode
                );
            }
        );
}


/* =========================================================
   ARTIKEL SPEICHERN
========================================================= */

async function artikelSpeichern(
    barcode
) {

    if (!aktuellerHaushaltId) {

        alert(
            "Kein Haushalt ausgewählt."
        );


        return;
    }


    const artikel = {

        household_id:
            aktuellerHaushaltId,

        barcode:
            barcode,

        name:
            document
                .getElementById(
                    "produktName"
                )
                .value
                .trim(),

        marke:
            document
                .getElementById(
                    "produktMarke"
                )
                .value
                .trim(),

        kategorie:
            document
                .getElementById(
                    "produktKategorie"
                )
                .value
                .trim() ||
            "Sonstiges",

        einheit:
            document
                .getElementById(
                    "produktEinheit"
                )
                .value,

        bestand:
            Number(
                document
                    .getElementById(
                        "produktBestand"
                    )
                    .value
            ),

        mindestbestand:
            Number(
                document
                    .getElementById(
                        "mindestbestand"
                    )
                    .value
            ),

        sollbestand:
            Number(
                document
                    .getElementById(
                        "sollbestand"
                    )
                    .value
            )
    };


    if (!artikel.name) {

        alert(
            "Bitte einen Produktnamen eingeben."
        );


        return;
    }


    if (
        artikel.bestand < 0 ||
        artikel.mindestbestand < 0 ||
        artikel.sollbestand < 0
    ) {

        alert(
            "Bestände dürfen nicht kleiner als 0 sein."
        );


        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("artikel")
            .insert([
                artikel
            ])
            .select();


    if (error) {

        console.error(
            "Fehler beim Speichern:",
            error
        );


        scanResult.innerHTML = `
            <strong>
                Fehler beim Speichern
            </strong>

            <br><br>

            ${escapeHtml(error.message)}
        `;


        return;
    }


    console.log(
        "Artikel in Supabase gespeichert:",
        data
    );


    scanResult.innerHTML = `
        <strong>
            Artikel gespeichert ✓
        </strong>

        <br><br>

        ${escapeHtml(artikel.name)}

        <br><br>

        Bestand:
        ${artikel.bestand}
        ${escapeHtml(artikel.einheit)}

        <br><br>

        Barcode:

        <br>

        ${escapeHtml(artikel.barcode)}
    `;
}


/* =========================================================
   GESPEICHERTEN ARTIKEL ANZEIGEN
========================================================= */

function gespeichertenArtikelAnzeigen(
    artikel
) {

    scanResult.innerHTML = `
        <div class="artikel-formular">

            <h3>
                ${escapeHtml(artikel.name)}
            </h3>


            <p>
                <strong>
                    Marke:
                </strong>

                ${escapeHtml(
                    artikel.marke ||
                    "-"
                )}
            </p>


            <p>
                <strong>
                    Kategorie:
                </strong>

                ${escapeHtml(
                    artikel.kategorie ||
                    "Sonstiges"
                )}
            </p>


            <p>
                <strong>
                    Bestand:
                </strong>

                <span
                    id="aktuellerBestand"
                >
                    ${artikel.bestand}
                </span>

                ${escapeHtml(
                    artikel.einheit
                )}
            </p>


            <p>
                <strong>
                    Mindestbestand:
                </strong>

                ${artikel.mindestbestand}
            </p>


            <p>
                <strong>
                    Sollbestand:
                </strong>

                ${artikel.sollbestand}
            </p>


            <div class="mengenwahl">

                <button
                    id="mengeMinus"
                >
                    −
                </button>


                <span
                    id="mengeAnzeige"
                >
                    1
                </span>


                <button
                    id="mengePlus"
                >
                    +
                </button>

            </div>


            <button
                id="artikelEntnehmen"
            >
                Entnehmen
            </button>


            <button
                id="artikelEinlagern"
            >
                Einlagern
            </button>

        </div>
    `;


    let menge =
        1;


    const mengeAnzeige =
        document.getElementById(
            "mengeAnzeige"
        );


    document
        .getElementById(
            "mengeMinus"
        )
        .addEventListener(
            "click",
            () => {

                if (
                    menge > 1
                ) {

                    menge--;

                    mengeAnzeige.textContent =
                        menge;
                }
            }
        );


    document
        .getElementById(
            "mengePlus"
        )
        .addEventListener(
            "click",
            () => {

                menge++;

                mengeAnzeige.textContent =
                    menge;
            }
        );


    document
        .getElementById(
            "artikelEntnehmen"
        )
        .addEventListener(
            "click",
            async () => {

                await bestandAendern(
                    artikel.barcode,
                    -menge
                );
            }
        );


    document
        .getElementById(
            "artikelEinlagern"
        )
        .addEventListener(
            "click",
            async () => {

                await bestandAendern(
                    artikel.barcode,
                    menge
                );
            }
        );
}


/* =========================================================
   BESTAND ÄNDERN
========================================================= */

async function bestandAendern(
    barcode,
    aenderung
) {

    const {
        data: treffer,
        error: suchFehler
    } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq(
                "barcode",
                barcode
            )
            .eq(
                "household_id",
                aktuellerHaushaltId
            )
            .limit(1);


    if (suchFehler) {

        console.error(
            "Fehler beim Laden:",
            suchFehler
        );


        return;
    }


    if (
        !treffer ||
        treffer.length === 0
    ) {

        alert(
            "Artikel wurde nicht gefunden."
        );


        return;
    }


    const artikel =
        treffer[0];


    let neuerBestand =
        Number(
            artikel.bestand
        ) +
        Number(
            aenderung
        );


    if (
        neuerBestand < 0
    ) {

        neuerBestand =
            0;
    }


    const {
        error: updateFehler
    } =
        await supabaseClient
            .from("artikel")
            .update({

                bestand:
                    neuerBestand
            })
            .eq(
                "barcode",
                barcode
            )
            .eq(
                "household_id",
                aktuellerHaushaltId
            );


    if (updateFehler) {

        console.error(
            "Fehler beim Aktualisieren:",
            updateFehler
        );


        return;
    }


    const bestandElement =
        document.getElementById(
            "aktuellerBestand"
        );


    if (
        bestandElement
    ) {

        bestandElement.textContent =
            neuerBestand;
    }


    zeigeSpeicherMeldung();
}


/* =========================================================
   SPEICHERMELDUNG
========================================================= */

function zeigeSpeicherMeldung() {

    let meldung =
        document.getElementById(
            "speicherMeldung"
        );


    if (!meldung) {

        meldung =
            document.createElement(
                "div"
            );


        meldung.id =
            "speicherMeldung";


        const formular =
            document.querySelector(
                ".artikel-formular"
            );


        if (!formular) {

            return;
        }


        formular.appendChild(
            meldung
        );
    }


    meldung.textContent =
        "Bestand aktualisiert ✓";


    meldung.classList.add(
        "sichtbar"
    );


    setTimeout(
        () => {

            meldung
                .classList
                .remove(
                    "sichtbar"
                );

        },
        1800
    );
}

/* =========================================================
   EINKAUFSLISTE
========================================================= */

async function einkaufslisteAnzeigen() {

    if (!aktuellerHaushaltId) {

        shoppingListContent.innerHTML = `
            <p>
                Kein Haushalt ausgewählt.
            </p>
        `;

        return;
    }


    const {
        data: artikel,
        error
    } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq(
                "household_id",
                aktuellerHaushaltId
            );


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
        (artikel || [])
            .filter(
                produkt =>
                    Number(
                        produkt.bestand
                    ) <=
                    Number(
                        produkt.mindestbestand
                    )
            )
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name,
                        "de"
                    )
            );


    if (
        einkaufsliste.length === 0
    ) {

        shoppingListContent.innerHTML = `
            <p>
                Aktuell muss nichts nachgekauft werden. ✓
            </p>
        `;


        return;
    }


    shoppingListContent.innerHTML =
        einkaufsliste
            .map(
                produkt => {

                    const kaufmenge =
                        Math.max(
                            Number(
                                produkt.sollbestand
                            ) -
                            Number(
                                produkt.bestand
                            ),
                            0
                        );


                    return `
                        <div class="shopping-item">

                            <strong>
                                ${escapeHtml(
                                    produkt.name
                                )}
                            </strong>

                            <span>
                                ${kaufmenge}
                                ${escapeHtml(
                                    produkt.einheit
                                )}
                                kaufen
                            </span>

                            <small>
                                Bestand:
                                ${produkt.bestand}
                            </small>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   BESTANDSÜBERSICHT + SUCHE
========================================================= */

async function bestandAnzeigen(
    suchtext = ""
) {

    if (!aktuellerHaushaltId) {

        stockContent.innerHTML = `
            <p>
                Kein Haushalt ausgewählt.
            </p>
        `;

        return;
    }


    const {
        data: artikel,
        error
    } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq(
                "household_id",
                aktuellerHaushaltId
            );


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


    if (
        !artikel ||
        artikel.length === 0
    ) {

        stockContent.innerHTML = `
            <p>
                Noch keine Artikel gespeichert.
            </p>
        `;


        return;
    }


    const filterText =
        suchtext
            .trim()
            .toLowerCase();


    const gefilterteArtikel =
        artikel.filter(
            produkt => {

                const name =
                    (
                        produkt.name ||
                        ""
                    ).toLowerCase();

                const marke =
                    (
                        produkt.marke ||
                        ""
                    ).toLowerCase();

                const kategorie =
                    (
                        produkt.kategorie ||
                        ""
                    ).toLowerCase();

                const barcode =
                    (
                        produkt.barcode ||
                        ""
                    ).toLowerCase();


                return (
                    name.includes(
                        filterText
                    ) ||
                    marke.includes(
                        filterText
                    ) ||
                    kategorie.includes(
                        filterText
                    ) ||
                    barcode.includes(
                        filterText
                    )
                );
            }
        );


    if (
        gefilterteArtikel.length === 0
    ) {

        stockContent.innerHTML = `
            <p>
                Kein passender Artikel gefunden.
            </p>
        `;


        return;
    }


    const kategorien =
        {};


    gefilterteArtikel
        .forEach(
            produkt => {

                const kategorie =
                    (
                        produkt.kategorie ||
                        ""
                    ).trim() ||
                    "Sonstiges";


                if (
                    !kategorien[
                        kategorie
                    ]
                ) {

                    kategorien[
                        kategorie
                    ] = [];
                }


                kategorien[
                    kategorie
                ].push(
                    produkt
                );
            }
        );


    let html =
        "";


    Object
        .keys(
            kategorien
        )
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "de"
                )
        )
        .forEach(
            kategorie => {

                html += `
                    <div class="stock-category">

                        <h3>
                            ${escapeHtml(
                                kategorie
                            )}
                        </h3>
                `;


                kategorien[
                    kategorie
                ]
                    .sort(
                        (a, b) =>
                            a.name.localeCompare(
                                b.name,
                                "de"
                            )
                    )
                    .forEach(
                        produkt => {

                            html += `
                                <div class="stock-item">

                                    <strong>
                                        ${escapeHtml(
                                            produkt.name
                                        )}
                                    </strong>

                                    <span>
                                        ${produkt.bestand}
                                        ${escapeHtml(
                                            produkt.einheit
                                        )}
                                    </span>

                                </div>
                            `;
                        }
                    );


                html += `
                    </div>
                `;
            }
        );


    stockContent.innerHTML =
        html;
}


/* =========================================================
   ARTIKELVERWALTUNG + SUCHE
========================================================= */

async function artikelverwaltungAnzeigen(
    suchtext = ""
) {

    if (!aktuellerHaushaltId) {

        manageContent.innerHTML = `
            <p>
                Kein Haushalt ausgewählt.
            </p>
        `;

        return;
    }


    const {
        data: artikel,
        error
    } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq(
                "household_id",
                aktuellerHaushaltId
            )
            .order(
                "name",
                {
                    ascending:
                        true
                }
            );


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


    if (
        !artikel ||
        artikel.length === 0
    ) {

        manageContent.innerHTML = `
            <p>
                Noch keine Artikel gespeichert.
            </p>
        `;


        return;
    }


    const filterText =
        suchtext
            .trim()
            .toLowerCase();


    const gefilterteArtikel =
        artikel.filter(
            produkt => {

                const name =
                    (
                        produkt.name ||
                        ""
                    ).toLowerCase();

                const marke =
                    (
                        produkt.marke ||
                        ""
                    ).toLowerCase();

                const barcode =
                    (
                        produkt.barcode ||
                        ""
                    ).toLowerCase();

                const kategorie =
                    (
                        produkt.kategorie ||
                        ""
                    ).toLowerCase();


                return (
                    name.includes(
                        filterText
                    ) ||
                    marke.includes(
                        filterText
                    ) ||
                    barcode.includes(
                        filterText
                    ) ||
                    kategorie.includes(
                        filterText
                    )
                );
            }
        );


    if (
        gefilterteArtikel.length === 0
    ) {

        manageContent.innerHTML = `
            <p>
                Kein passender Artikel gefunden.
            </p>
        `;


        return;
    }


    manageContent.innerHTML =
        gefilterteArtikel
            .map(
                produkt => {

                    return `
                        <div class="manage-item">

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        produkt.name
                                    )}
                                </strong>

                                <small>

                                    ${escapeHtml(
                                        produkt.kategorie ||
                                        "Sonstiges"
                                    )}

                                    <br>

                                    Barcode:
                                    ${escapeHtml(
                                        produkt.barcode
                                    )}

                                </small>

                            </div>

                            <button
                                class="editButton"
                                data-barcode="${escapeHtml(
                                    produkt.barcode
                                )}"
                            >
                                Bearbeiten
                            </button>

                        </div>
                    `;
                }
            )
            .join("");


    document
        .querySelectorAll(
            ".editButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        artikelBearbeiten(
                            button.dataset.barcode
                        );
                    }
                );
            }
        );
}


/* =========================================================
   ARTIKEL BEARBEITEN
========================================================= */

async function artikelBearbeiten(
    barcode
) {

    const {
        data: treffer,
        error
    } =
        await supabaseClient
            .from("artikel")
            .select("*")
            .eq(
                "barcode",
                barcode
            )
            .eq(
                "household_id",
                aktuellerHaushaltId
            )
            .limit(1);


    if (error) {

        console.error(
            "Fehler beim Laden des Artikels:",
            error
        );


        alert(
            "Artikel konnte nicht geladen werden."
        );


        return;
    }


    if (
        !treffer ||
        treffer.length === 0
    ) {

        alert(
            "Artikel wurde nicht gefunden."
        );


        return;
    }


    const produkt =
        treffer[0];


    manageContent.innerHTML = `
        <div class="artikel-formular">

            <h3>
                Artikel bearbeiten
            </h3>


            <label>
                Produktname
            </label>

            <input
                id="editName"
                type="text"
                value="${escapeHtml(
                    produkt.name
                )}"
            >


            <label>
                Marke
            </label>

            <input
                id="editMarke"
                type="text"
                value="${escapeHtml(
                    produkt.marke ||
                    ""
                )}"
            >


            <label>
                Kategorie
            </label>

            <input
                type="text"
                id="editKategorie"
                value="${escapeHtml(
                    produkt.kategorie ||
                    ""
                )}"
                placeholder="Kategorie eingeben"
                autocomplete="off"
            >


            <label>
                Einheit
            </label>

            <select
                id="editEinheit"
            >

                <option value="Stück">
                    Stück
                </option>

                <option value="Packung">
                    Packung
                </option>

                <option value="Flasche">
                    Flasche
                </option>

                <option value="Glas">
                    Glas
                </option>

                <option value="Dose">
                    Dose
                </option>

            </select>


            <label>
                Aktueller Bestand
            </label>

            <input
                id="editBestand"
                type="number"
                min="0"
                value="${produkt.bestand}"
            >


            <label>
                Mindestbestand
            </label>

            <input
                id="editMindestbestand"
                type="number"
                min="0"
                value="${produkt.mindestbestand}"
            >


            <label>
                Sollbestand
            </label>

            <input
                id="editSollbestand"
                type="number"
                min="0"
                value="${produkt.sollbestand}"
            >


            <button
                id="saveEditButton"
            >
                Änderungen speichern
            </button>


            <button
                id="deleteArticleButton"
            >
                Artikel löschen
            </button>


            <button
                id="cancelEditButton"
            >
                Zurück
            </button>

        </div>
    `;


    const editEinheit =
        document.getElementById(
            "editEinheit"
        );


    const bekannteEinheiten = [
        "Stück",
        "Packung",
        "Flasche",
        "Glas",
        "Dose"
    ];


    if (
        produkt.einheit &&
        !bekannteEinheiten.includes(
            produkt.einheit
        )
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            produkt.einheit;


        option.textContent =
            produkt.einheit;


        editEinheit.appendChild(
            option
        );
    }


    editEinheit.value =
        produkt.einheit ||
        "Stück";


    document
        .getElementById(
            "saveEditButton"
        )
        .addEventListener(
            "click",
            () => {

                artikelAenderungenSpeichern(
                    barcode
                );
            }
        );


    document
        .getElementById(
            "deleteArticleButton"
        )
        .addEventListener(
            "click",
            () => {

                artikelLoeschen(
                    barcode
                );
            }
        );


    document
        .getElementById(
            "cancelEditButton"
        )
        .addEventListener(
            "click",
            () => {

                artikelverwaltungAnzeigen(
                    manageSearch
                        ? manageSearch.value
                        : ""
                );
            }
        );
}


/* =========================================================
   ÄNDERUNGEN SPEICHERN
========================================================= */

async function artikelAenderungenSpeichern(
    barcode
) {

    const aenderungen = {

        name:
            document
                .getElementById(
                    "editName"
                )
                .value
                .trim(),

        marke:
            document
                .getElementById(
                    "editMarke"
                )
                .value
                .trim(),

        kategorie:
            document
                .getElementById(
                    "editKategorie"
                )
                .value
                .trim() ||
            "Sonstiges",

        einheit:
            document
                .getElementById(
                    "editEinheit"
                )
                .value,

        bestand:
            Number(
                document
                    .getElementById(
                        "editBestand"
                    )
                    .value
            ),

        mindestbestand:
            Number(
                document
                    .getElementById(
                        "editMindestbestand"
                    )
                    .value
            ),

        sollbestand:
            Number(
                document
                    .getElementById(
                        "editSollbestand"
                    )
                    .value
            )
    };


    if (
        !aenderungen.name
    ) {

        alert(
            "Bitte einen Produktnamen eingeben."
        );


        return;
    }


    if (
        aenderungen.bestand < 0 ||
        aenderungen.mindestbestand < 0 ||
        aenderungen.sollbestand < 0
    ) {

        alert(
            "Bestände dürfen nicht kleiner als 0 sein."
        );


        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("artikel")
            .update(
                aenderungen
            )
            .eq(
                "barcode",
                barcode
            )
            .eq(
                "household_id",
                aktuellerHaushaltId
            );


    if (error) {

        console.error(
            "Fehler beim Speichern:",
            error
        );


        alert(
            "Änderungen konnten nicht gespeichert werden."
        );


        return;
    }


    await artikelverwaltungAnzeigen(
        manageSearch
            ? manageSearch.value
            : ""
    );
}


/* =========================================================
   ARTIKEL LÖSCHEN
========================================================= */

async function artikelLoeschen(
    barcode
) {

    const bestaetigt =
        confirm(
            "Soll dieser Artikel wirklich gelöscht werden?"
        );


    if (!bestaetigt) {

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("artikel")
            .delete()
            .eq(
                "barcode",
                barcode
            )
            .eq(
                "household_id",
                aktuellerHaushaltId
            );


    if (error) {

        console.error(
            "Fehler beim Löschen:",
            error
        );


        alert(
            "Artikel konnte nicht gelöscht werden."
        );


        return;
    }


    await artikelverwaltungAnzeigen(
        manageSearch
            ? manageSearch.value
            : ""
    );
}


/* =========================================================
   AUTH STATUS
========================================================= */

supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        if (session) {

            authArea
                .classList
                .add(
                    "hidden"
                );


            householdArea
                .classList
                .add(
                    "hidden"
                );


            appArea
                .classList
                .add(
                    "hidden"
                );


            await haushaltPruefen();

        } else {

            aktuellerHaushaltId =
                null;


            aktuellerHaushalt =
                null;


            authArea
                .classList
                .remove(
                    "hidden"
                );


            householdArea
                .classList
                .add(
                    "hidden"
                );


            appArea
                .classList
                .add(
                    "hidden"
                );
        }
    }
);

if (showInviteCodeButton) {

    showInviteCodeButton.addEventListener(
        "click",
        () => {

            if (!inviteCodeDisplay) {
                return;
            }

            if (
                !aktuellerHaushalt ||
                !aktuellerHaushalt.invite_code
            ) {

                inviteCodeDisplay.textContent =
                    "Kein Einladungscode verfügbar.";

                inviteCodeDisplay.classList.remove("hidden");

                return;
            }

            inviteCodeDisplay.textContent =
                "Einladungscode: " +
                aktuellerHaushalt.invite_code;

            inviteCodeDisplay.classList.remove("hidden");
        }
    );
}


if (changeHouseholdButton) {

    changeHouseholdButton.addEventListener(
        "click",
        async () => {

            await alleBereicheSchliessen();

            appArea.classList.add("hidden");

            householdArea.classList.remove("hidden");

            householdInfo.textContent =
                "Erstelle einen neuen Haushalt oder tritt einem bestehenden bei.";
        }
    );
}


/* =========================================================
   START
========================================================= */

sessionPruefen();