//Elementos html:
const inputUpdateName = document.querySelector("#inputUpdateName")
const inputUpdateApellidos = document.querySelector("#inputUpdateApellidos")
const inputUpdateEmail = document.querySelector("#inputUpdateEmail")
const inputUpdateCentro = document.querySelector("#inputUpdateCentro")
const inputUpdateCurso = document.querySelector("#inputUpdateCurso")
const formUpdateTecData = document.querySelector("#formUpdateTecData")

const container = document.querySelector("#container")

const alertError = document.querySelector(".alert-danger")
const alertLight = document.querySelector(".alert-light")


//Ejemplo si el login lo ha realizado el técnico con el id 4
const tecId = 1
let tecData

//Accedemos al token desde el sessionStorage
//const token = sessionStorage.getItem("token")
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c3VhcmlvSWQiOjEsImNyZWF0ZWRBdCI6MTY3ODg4MzgyNiwiZXhwaXJlZEF0IjoxNjc4OTA1NDI2fQ.b4a-zh4T0bEutTKrBtRv5-VI_AWtJgR6He2T1n_zHhA"

//Función para hacer una petición a cualquier api. Recibe la url de la petición y el método y el body en caso de necesitarlo.
//Por defecto el método será GET y el body null

const apiRequest = async (url, token, method = "GET", body = null) => {
    return fetch(url,
        {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                "key": token,
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
        tecData = await apiRequest(`http://localhost:3000/sanitaria/tecnicos/info/${tecId}`, token)
        //Muestro en los input los datos del técnicos

        inputUpdateName.value = tecData.nombre
        inputUpdateApellidos.value = tecData.apellidos
        inputUpdateEmail.value = tecData.email
        changeOptionSelected(Array.from(inputUpdateCentro.children), tecData.centro)
        changeOptionSelected(Array.from(inputUpdateCurso.children), tecData.curso)
    } else {//Si no se le redirigiría al login

    }
}

//Patch para actualizar los datos del técnico:
const updateTecData = async (ev) => {
    ev.preventDefault()
    alertError.classList.add("d-none")
    alertLight.classList.add("d-none")

    if (await apiRequest(
        `http://localhost:3000/sanitaria/tecnicos/${tecId}`,
        token,
        "PUT",
        JSON.stringify(
            {
                nombre: inputUpdateName.value,
                apellidos: inputUpdateApellidos.value,
                email: inputUpdateEmail.value,
                centro: inputUpdateCentro.value,
                curso: inputUpdateCurso.value,
            }
        )
    ).error) {//Si se ha producido algún error
        alertError.classList.remove("d-none")
    } else {//Si se ha producido la actualización correctamente
        alertLight.classList.remove("d-none")
    }

}



document.addEventListener("DOMContentLoaded", loadTecData)//Cargo los datos del técnico que ha iniciado sesión
formUpdateTecData.addEventListener("submit", (ev) => { updateTecData(ev) });
