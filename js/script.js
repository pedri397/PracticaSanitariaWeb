const tbodyCassettes = document.querySelector("#tbodyCassettes")
const cardCassette = document.querySelector("#cardCassette")
const tbodyMuestras = document.querySelector("#tbodyMuestras")

const selectOrgano = document.querySelector("#selectOrgano")
const inputFechaInicio = document.querySelector("#inputFechaInicio")
const inputFechaFin = document.querySelector("#inputFechaFin")
const btnFiltrarFechas = document.querySelector("#btnFiltrarFechas")
const btnborrar = document.querySelector("#btnborrar")
const btnmodificar = document.querySelector("#btnmodificar")




const user = JSON.parse(sessionStorage.getItem("user"))
const token = sessionStorage.getItem("token")
//*Si no hay token se redirige al login
//*TODO: esto debería controlarse con sessiones
if (!token) { location.href = '../index.html' }

let cassettes = []
let idCassette = 0

inputFechaFin.setAttribute("MAX", new Date().toLocaleDateString('fr-ca'))
inputFechaInicio.setAttribute("MAX", new Date().toLocaleDateString('fr-ca'))


// Elimina los diacríticos de un texto (ES6)
//
function eliminarDiacriticos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

const nuevaCelda = (dato, colspan = 0) => {
    let nuevacelda = document.createElement("TD");
    nuevacelda.setAttribute("COLSPAN", colspan)
    nuevacelda.append(dato);
    return nuevacelda;
};

const nuevoSpan = (texto) => {
    let nuevoSpan = document.createElement("SPAN");
    nuevoSpan.append(texto);
    return nuevoSpan;
};

const printQR = (imgQR, url) => {
    new QRious({
        element: imgQR,
        value: url, // La URL o el texto
        size: 150,
        backgroundAlpha: 0, // 0 para fondo transparente
        foreground: "black", // Color del QR
        level: "H", // Puede ser L,M,Q y H (L es el de menor nivel, H el mayor)
    });
}

const printCassettes = (cassettes) => {
    tbodyCassettes.innerHTML = ""
    let fragment = document.createDocumentFragment();

    if (cassettes.length === 0) {//Si no hay muestras
        let nuevafila = document.createElement("TR");
        nuevafila.classList.add("text-center")
        nuevafila.append(nuevaCelda("Actualmente no hay Cassettes para los parámetros seleccionados", 4));
        fragment.append(nuevafila);
    } else {
        cassettes.map(cassette => {
            let nuevafila = document.createElement("TR");
            nuevafila.append(nuevaCelda(cassette.fecha.split("T")[0]));
            nuevafila.append(nuevaCelda(cassette.caracteristicas));
            nuevafila.append(nuevaCelda(cassette.organo));
            nuevafila.append(nuevaCelda(cassette.id));
            fragment.append(nuevafila);
        })
    }


    tbodyCassettes.append(fragment);
}

const printCassetteData = (cassette) => {
    cardCassette.children[1].children[0].children[1].textContent = cassette.organo
    cardCassette.children[1].children[1].children[1].textContent = cassette.fecha.split("T")[0]
    cardCassette.children[1].children[2].children[1].textContent = cassette.caracteristicas
    cardCassette.children[1].children[3].children[1].textContent = cassette.observaciones
    cardCassette.children[1].children[4].children[0].innerHTML = ""
    let imgQR = document.createElement("IMG")
    cardCassette.children[1].children[4].children[0].appendChild(imgQR)
    printQR(imgQR, cassette.codigoQR.split("QRCODE~")[1])

}

const printMuestras = (muestras) => {
    tbodyMuestras.innerHTML = ""
    let fragment = document.createDocumentFragment();

    if (muestras.length === 0) {//Si no hay muestras
        let nuevafila = document.createElement("TR");
        nuevafila.classList.add("text-center")
        nuevafila.append(nuevaCelda("Actualmente no hay muestras para el Cassette seleccionado", 3));
        fragment.append(nuevafila);
    } else {
        muestras.map(muestra => {
            let nuevafila = document.createElement("TR");
            nuevafila.append(nuevaCelda(muestra.fecha.split("T")[0]));
            nuevafila.append(nuevaCelda(muestra.observaciones));
            nuevafila.append(nuevaCelda(muestra.tincion));
            fragment.append(nuevafila);
        })
    }
    tbodyMuestras.append(fragment);

}

const apiRequest = async (url, token, method = "GET", body = null) => {
    return fetch(url,
        {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'key': token,
            },
            body: body
        })
        .then(response => response.json())
        .then(response => response)
        .catch(error => console.log(error));
}

const loadCassetteData = async (ev) => {
    if (ev.target.tagName == "TD" && ev.target.parentElement.lastChild.getAttribute("colspan") == 0) {
        idCassette = ev.target.parentElement.lastChild.textContent;
        let muestras = await apiRequest(
            `http://localhost:3000/sanitaria/cassettes/muestras/${idCassette}`,
            token,
        )
        printCassetteData(muestras)
        printMuestras(muestras.muestras)
    }
}

const loadData = async (ev) => {
    console.log(ev)
    if (token) {
        if (ev.target.tagName == "SELECT") {//Filtrar por órgano
            cassettes = await apiRequest(
                `http://localhost:3000/sanitaria/cassettes/organo/${eliminarDiacriticos(selectOrgano.value.toUpperCase())}`,
                token,
            )
        } else if (ev.target.id == "btnFiltrarFechas") {//Filtrar por fechas
            ev.preventDefault()
            if (inputFechaInicio !== "" && inputFechaFin !== "" && inputFechaInicio.value <= inputFechaFin.value) {//Si las fechas están completas y la de inicio es menor que la de fin se hace la petición
                cassettes = await apiRequest(
                    `http://localhost:3000/sanitaria/cassettes/dates/${inputFechaInicio.value}/${inputFechaFin.value}`,
                    token,
                )
            }
        } else if (ev.target == document) {//Cargar los 20 más recientes
            cassettes = await apiRequest(
                //`http://localhost:3000/sanitaria/cassettes/tecnico/${user.id}`, //Así se cargarían los del técnico que ha hecho el login
                `http://localhost:3000/sanitaria/cassettes/`,
                token,
            )
        }
        if (cassettes.error) { location.href = '../index.html' }//Si el token ha expirado le redirijo al index
        printCassettes(cassettes)
    } else {//*Si no tiene token se le redirigiría al login
        location.href = '../index.html'
    }
}

const removeCassette = async (ev) => {
    if (idCassette != 0) {//Si ha seleccionado algún cassete para borrarlo
        if (await apiRequest(
            //`http://localhost:3000/sanitaria/cassettes/tecnico/${user.id}`, //Así se cargarían los del técnico que ha hecho el login
            `http://localhost:3000/sanitaria/cassettes/${idCassette}`,
            token,
            "DELETE"
        ).error) {//Si se ha producido algún error
            console.log("error")
        } else {//Si el borrado se ha producido correctamente
            console.log("borrado")
            window.location.reload()//Actualizo la página
        }
    }
}



document.addEventListener("DOMContentLoaded", (ev) => { loadData(ev) })//Cargo los datos del técnico que ha iniciado sesión
tbodyCassettes.addEventListener("click", loadCassetteData)
selectOrgano.addEventListener("change", (ev) => { loadData(ev) })
btnFiltrarFechas.addEventListener("click", (ev) => { loadData(ev) })
btnborrar.addEventListener("click", (ev) => { removeCassette(ev) })


