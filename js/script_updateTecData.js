//Elementos html:
const inputUpdateName = document.querySelector("#inputUpdateName")
const inputUpdateApellidos = document.querySelector("#inputUpdateApellidos")
const inputUpdateEmail = document.querySelector("#inputUpdateEmail")
const inputUpdateCentro = document.querySelector("#inputUpdateCentro")
const inputUpdateCurso = document.querySelector("#inputUpdateCurso")
const formUpdateTecData = document.querySelector("#formUpdateTecData")

const container = document.querySelector("#container")

const alertError = document.querySelector(".alert-danger")
const alertUpdated = document.querySelector(".alert-primary")
const alertWarning = document.querySelector(".alert-warning")

let tecData

//Ejemplo si el login lo ha realizado el técnico con el id 1
const user = JSON.parse(sessionStorage.getItem("user"))


const token = sessionStorage.getItem("token")
//*Si no hay token se redirige al login
//*TODO: esto debería controlarse con sessiones
if (!token) { location.href = '../index.html' }

//Función para hacer una petición a cualquier api. Recibe la url de la petición y el método y el body en caso de necesitarlo.
//Por defecto el método será GET y el body null

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

const changeOptionSelected = (select, optionSelected) => {
    select.map(option => {
        if (option.value == optionSelected) {
            option.setAttribute('SELECTED', true)
        }
    })
}



//Guardo los datos del técnico
const loadTecData = async () => {
    if (token) {//Si existe el token
        tecData = await apiRequest(`http://localhost:3000/sanitaria/tecnicos/${user.id}`, token)
        //Muestro en los input los datos del técnicos

        inputUpdateName.value = tecData.nombre
        inputUpdateApellidos.value = tecData.apellidos
        inputUpdateEmail.value = tecData.email
        changeOptionSelected(Array.from(inputUpdateCentro.children), tecData.centro)
        changeOptionSelected(Array.from(inputUpdateCurso.children), tecData.curso)
    } else {//*Si no tiene token se le redirigiría al login
        sessionStorage.removeItem('token');
        location.href = '../index.html'
    }
}

//Patch para actualizar los datos del técnico:
const updateTecData = async (ev) => {
    ev.preventDefault()
    alertError.classList.add("d-none")
    alertWarning.classList.add("d-none")
    alertUpdated.classList.add("d-none")

    let inputEmpty = false
    const newTecData =
    {
        nombre: inputUpdateName.value.trim(),
        apellidos: inputUpdateApellidos.value.trim(),
        email: inputUpdateEmail.value.trim(),
        centro: inputUpdateCentro.value.trim(),
        curso: inputUpdateCurso.value.trim(),
    }
    for (let i in newTecData) {
        if (newTecData[i] === "") {
            inputEmpty = true
        }
    }
    if (inputEmpty) {//Si hay algún campo vacio
        alertWarning.classList.remove("d-none")
    } else {
        if (await apiRequest(
            `http://localhost:3000/sanitaria/tecnicos/${user.id}`,
            token,
            "PUT",
            JSON.stringify(newTecData)
        ).error) {//Si se ha producido algún error
            alertError.classList.remove("d-none")
        } else {//Si se ha producido la actualización correctamente
            alertUpdated.classList.remove("d-none")
        }
    }
}



document.addEventListener("DOMContentLoaded", loadTecData)//Cargo los datos del técnico que ha iniciado sesión
formUpdateTecData.addEventListener("submit", (ev) => { updateTecData(ev) });
