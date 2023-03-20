const inputEmail = document.querySelector("#inputEmail")
const inputPass = document.querySelector("#inputPass")
const formLogin = document.querySelector("#formLogin")
const alertError = document.querySelector(".alert-danger")


const apiRequest = async (url, body = null, method = "GET") => {
    return fetch(url,
        {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        })
        .then(response => response.json())
        .then(response => response)
        .catch(error => console.log(error));
}

const login = async (ev) => {
    ev.preventDefault()

    //*TODO: deberían controlarse las sessiones desde el servidor
    const loginData =
    {
        email: inputEmail.value.trim(),
        password: inputPass.value.trim(),
    }


    const loginUser = await apiRequest(
        `http://localhost:3000/sanitaria/tecnicos/login`,
        JSON.stringify(loginData),
        "POST"
    )

    if (loginUser.error) {
        alertError.classList.remove("d-none")
    } else {
        sessionStorage.setItem("user", JSON.stringify(await apiRequest(`http://localhost:3000/sanitaria/tecnicos/info/${loginData.email}`)))
        sessionStorage.setItem("token", loginUser.token)
        location.href = './pages/home.html';

    }

}

//*LISTENERS
formLogin.addEventListener("submit", (ev) => { login(ev) });
