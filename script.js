const textElement = document.getElementById('text');
const formElement = document.getElementById('form');
const imgElement = document.getElementById('img');
const showElement = document.getElementById('show');
const toggleSwitch = document.querySelector('input[type="checkbox"]');
const icon = document.getElementById('icon');
const toggleText = document.querySelector('.toggle-text');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('close-modal');
const genderElement = document.getElementById('gender');
const ageElement = document.getElementById('age');
const multiculturalElement = document.getElementById('multicultural');
const Clarifai = require('clarifai');
const dark_mode = "dark";
const light_mode = "light";
let count = 0;
//Clean the list element .
function cleanData(targetID) {
    document.getElementById(`${targetID}`).textContent = '';
}
//Create list element 
function createList(array, arrayType) {

    array.forEach(element => {
        const li = document.createElement('li');
        li.textContent = `${arrayType} : ${element.name} , ${Math.floor(element.value * 100)}%`;
        document.getElementById(element.vocab_id).appendChild(li);

    });

}
// Show Modal 
function showModal() {
    modal.classList.add('show-modal');
}
//Close Modal
function closeModal() {
    modal.classList.remove('show-modal');
}
//Dark & Light Switcher
function switcherDarkLight(variable) {
    variable === "dark"
        ? document.documentElement.setAttribute('data-theme', 'dark')
        : document.documentElement.setAttribute('data-theme', 'light');

    variable === "dark"
        ? icon.className = "fas fa-moon"
        : icon.className = "fas fa-sun";

    variable === "dark"
        ? icon.style.color = "white"
        : icon.style.color = "black";

    variable === "dark"
        ? toggleText.textContent = "Dark Mode"
        : toggleText.textContent = "Light Mode";
}
// Finding the position of the face box
const calculateFaceLocation = (data) => {
    const dataInfo = data.outputs[0].data.regions[0].data.concepts;
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const width = Number(imgElement.width);
    const height = Number(imgElement.height);
    const box = document.getElementById('bounding-box');
    const elementPosition = {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
    }
    box.style.left = `${elementPosition.leftCol}px`;
    box.style.right = `${elementPosition.rightCol}px`;
    box.style.bottom = `${elementPosition.bottomRow}px`;
    box.style.top = `${elementPosition.topRow}px`;

    const filterItem = dataInfo.filter(el => el.value > 0.5);
    const gender = filterItem.filter(el => el.vocab_id === "gender_appearance").sort((a, b) => b.value - a.value);
    const age = filterItem.filter(el => el.vocab_id === "age_appearance").filter(el => el.value > 0.5).sort((a, b) => b.value - a.value);
    const multicultural = filterItem.filter(el => el.vocab_id === "multicultural_appearance").sort((a, b) => b.value - a.value);

    createList(age, 'Age');
    createList(multicultural, 'Multicultural');
    createList(gender, 'Gender');

}

// Sending the image to the API
const sendData = () => {
    const app = new Clarifai.App({
        apiKey: 'acd573ddf7df4d409a06eb22e1768f6b'
    });

    app.models.predict(Clarifai.DEMOGRAPHICS_MODEL, textElement.value)
        .then(response => calculateFaceLocation(response))
        .catch(e => alert(e))
}

// Theme Switcher
function switchTheme(event) {
    if (event.target.checked) {
        switcherDarkLight(dark_mode);
        localStorage.setItem('theme', 'dark');
    } else {
        switcherDarkLight(light_mode)
        localStorage.setItem('theme', 'light');
    }
}
//Listeners
formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    imgElement.src = textElement.value;
    if (count === 0) {
        setTimeout(() => {
            sendData();
            showModal();
            cleanData('age_appearance');
            cleanData('gender_appearance');
            cleanData('multicultural_appearance');
            count++;
        }, 2000);


    } else {
        cleanData('age_appearance');
        cleanData('gender_appearance');
        cleanData('multicultural_appearance');
        setTimeout(() => {
            sendData();
            showModal();
            count = 0;
        }, 2000)

    }
});


const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === "dark") {
        toggleSwitch.checked = true;
        switcherDarkLight(dark_mode);
        localStorage.setItem('theme', 'dark');
    }
}

toggleSwitch.addEventListener('change', switchTheme);
modalClose.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    e.target === modal ? closeModal() : false;
});

genderElement.addEventListener('click', () => {
    document.getElementById('gender_appearance').hidden = !document.getElementById('gender_appearance').hidden;
});
ageElement.addEventListener('click', () => {
    document.getElementById('age_appearance').hidden = !document.getElementById('age_appearance').hidden;
});
multiculturalElement.addEventListener('click', () => {

    document.getElementById('multicultural_appearance').hidden = !document.getElementById('multicultural_appearance').hidden;
});



