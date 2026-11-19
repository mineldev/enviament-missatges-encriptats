console.log("Aplicacio carregada correctament");

let clavesCifrado = null;
let clavePublicaRemota = null;
let clavesFirma = null;
let claveFirmaRemota = null;

crypto.subtle.generateKey();

function convertirBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

async function generarClaves() {

    clavesCifrado = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );

    let clavePublica = await crypto.subtle.exportKey(
        "spki",
        clavesCifrado.publicKey
    );

    let clavePrivada = await crypto.subtle.exportKey(
        "pkcs8",
        clavesCifrado.privateKey
    );

    document.getElementById("clavePublica").value =
        convertirBase64(clavePublica);

    document.getElementById("clavePrivada").value =
        convertirBase64(clavePrivada);
}

document.getElementById("generarClaves").addEventListener("click", generarTodo);
document.getElementById("importarFirma").addEventListener("click", importarClaveFirma);

function convertirArrayBuffer(base64) {
    let binario = atob(base64.replace(/\s/g, ""));
    let bytes = new Uint8Array(binario.length);

    for (let i = 0; i < binario.length; i++) {
        bytes[i] = binario.charCodeAt(i);
    }

    return bytes;
}

async function importarClaves() {

    let claveBase64 = document.getElementById("claveRemota").value;

    let claveBinaria = convertirArrayBuffer(claveBase64);

    clavePublicaRemota = await crypto.subtle.importKey(
        "spki",
        claveBinaria,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["encrypt"]
    );

    alert("Clau publica importada correctament");
}

document.getElementById("importarClaves").addEventListener("click", importarClaves);

async function generarClavesFirma() {

    clavesFirma = await crypto.subtle.generateKey(
        {
            name: "RSA-PSS",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["sign", "verify"]
    );

}

async function exportarClavesFirma() {

    let publica = await crypto.subtle.exportKey(
        "spki",
        clavesFirma.publicKey
    );

    let privada = await crypto.subtle.exportKey(
        "pkcs8",
        clavesFirma.privateKey
    );

    document.getElementById("clavePublicaFirma").value =
        convertirBase64(publica);

    document.getElementById("clavePrivadaFirma").value =
        convertirBase64(privada);
}

async function importarClaveFirma() {

    let claveBase64 = document.getElementById("claveFirmaRemota").value;

    let claveBinaria = convertirArrayBuffer(claveBase64);

    claveFirmaRemota = await crypto.subtle.importKey(
        "spki",
        claveBinaria,
        {
            name: "RSA-PSS",
            hash: "SHA-256"
        },
        false,
        ["verify"]
    );

    alert("Clau de signatura importada correctament");
}

async function generarTodo() {

    await generarClaves();

    await generarClavesFirma();

    await exportarClavesFirma();

}

async function firmarMensaje() {

    let mensaje = document.getElementById("mensaje").value;

    let mensajeBytes = new TextEncoder().encode(mensaje);

    let firma = await crypto.subtle.sign(
        {
            name: "RSA-PSS",
            saltLength: 32
        },
        clavesFirma.privateKey,
        mensajeBytes
    );

    let firmaBase64 = convertirBase64(firma);

    let objeto = {
        missatge: mensaje,
        signatura: firmaBase64
    };

    document.getElementById("mensaje").value = JSON.stringify(objeto, null, 4);

}

document.getElementById("firmarMensaje").addEventListener("click", firmarMensaje);