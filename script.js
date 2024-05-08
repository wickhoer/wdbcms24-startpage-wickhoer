
// QUOTE fetching
async function quoteFetch() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();

        const { content, author } = data;

        const fetchedQuote = `"${content}" - ${author}`;

        document.querySelector('.quote').innerText = fetchedQuote;
    } catch (error) {
        console.error('Error fetching quote:', error);
        document.querySelector('.quote').style.color = 'red';
        document.querySelector('.quote').style.fontStyle = 'italic'
        document.querySelector('.quote').innerText = 'Vi stötte på ett tekniskt problem gällande quotes. Försök starta om sidan!';
    }
}

// IP fetching 

async function ipFetch() {
    try {

        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;

        document.querySelector('.dispIP').innerText = ip;

    } catch (error) {
        console.error('Error fetching IP address', error);
        document.querySelector('.dispIP').style.color = 'yellow';
        document.querySelector('.dispIP').style.fontStyle = 'italic'
        document.querySelector('.dispIP').innerText = 'Vi stötte på ett tekniskt problem gällande IP. Försök starta om sidan!';
    }
}

// GEO fetching

async function fetchGeo() {
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;


                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                const data = await response.json();
                const city = data.address.city;
                const country = data.address.country;


                document.querySelector('.dispGeo').innerText = `${city}, ${country}`;
                document.querySelector('.cityDisp').innerText = `Väder ${city}`;

                dispWeath(city);

            }, function (error) {
                console.error('Error fetching geolocation:', error);
                document.querySelector('.dispGeo').style.color = 'yellow';
                document.querySelector('.dispGeo').style.fontStyle = 'italic'
                document.querySelector('.dispGeo').innerText = 'Du måste låta oss komma åt din lokation.';
                document.querySelector('.weathDisp').style.color = 'yellow';
                document.querySelector('.weathDisp').style.fontStyle = 'italic'
                document.querySelector('.weathDisp').innerText = 'Du måste låta oss komma åt din lokation.';
            });
        } else {
            console.error('Geolocation är ej supported.');
        }
    } catch (error) {
        console.error('Error fetching geolocation:', error);
        document.querySelector('.dispGeo').style.color = 'yellow';
        document.querySelector('.dispGeo').style.fontStyle = 'italic'
        document.querySelector('.dispGeo').innerText = 'Vi stötte på ett tekniskt problem gällande platsen. Försök starta om sidan!';
    }
}

// Logik med valutakurserna

const euro = 'EUR';
const trgCur = 'USD,GBP,SEK';

async function dispRates(euro, trgCur) {
    const rates = await fetchRates(euro, trgCur);
    if (rates) {
        let curInfo = '';
        for (const currency in rates) {
            curInfo += `• ${rates[currency]} ${currency}\n`;
        }
        document.querySelector('.curDisp').innerText = curInfo;
    } else {
        document.querySelector('.curDisp').style.color = 'red';
        document.querySelector('.curDisp').style.fontStyle = 'italic'
        document.querySelector('.curDisp').innerText = 'Vi stötte på ett tekniskt problem gällande valutorna. Försök starta om sidan!';
    }
}

async function fetchRates(euro, trgCur) {
    try {
        const response = await fetch(`https://api.frankfurter.app/latest?base=${euro}&symbols=${trgCur}`);
        const data = await response.json();
        return data.rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        document.querySelector('.curDisp').style.color = 'red';
        document.querySelector('.curDisp').style.fontStyle = 'italic'
        document.querySelector('.curDisp').innerText = 'Vi stötte på ett tekniskt problem gällande valutorna. Försök starta om sidan!';
        return null;
    }
}

// Väderwidgeten

async function dispWeath(city) {
    try {
        const data = await fetchWeath(city);
        if (data) {
            const temperature = data.main.temp;
            const windSpeed = data.wind.speed;
            const weatherDescription = data.weather[0].description;
            const weatherIcon = data.weather[0].icon;

            document.querySelector('.imgDisp').innerHTML = `<img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" class="img-fluid" alt="Weather Icon">`;
            document.querySelector('.weathDisp').innerText = `${Math.round(temperature)}°C, ${Math.round(windSpeed)} m/s\n${weatherDescription}`;

        } else {
            document.querySelector('.weathDisp').style.color = 'yellow';
            document.querySelector('.weathDisp').style.fontStyle = 'italic'
            document.querySelector('.weathDisp').innerText = 'Vi stötte på ett tekniskt problem gällande vädret. Försök starta om sidan!';

        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.querySelector('.weathDisp').style.color = 'yellow';
        document.querySelector('.weathDisp').style.fontStyle = 'italic'
        document.querySelector('.weathDisp').innerText = 'Vi stötte på ett tekniskt problem gällande vädret. Granska din weatherAPIkey! Försök starta om sidan!';
    }
}

async function fetchWeath(city) {
    const weatherKey = localStorage.getItem('weatherApiKey');
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}&units=metric`;

    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.querySelector('.weathDisp').style.color = 'yellow';
        document.querySelector('.weathDisp').style.fontStyle = 'italic'
        document.querySelector('.weathDisp').innerText = 'Vi stötte på ett tekniskt problem gällande vädret. Försök starta om sidan!';
    }
}

// AMA by ChatGPT

document.addEventListener('DOMContentLoaded', () => {

    const sendButton = document.getElementById('sendButton');

    sendButton.addEventListener('click', async () => {

        const question = document.getElementById('userInput').value;


        if (!question) {
            document.querySelector('#response').innerHTML = `<span style="color: red;">Skriv något före du klickar!</span>`;
            return;
        }

        await askGPT(question);
    });
});

async function askGPT(question) {
    try {

        const apiKey = localStorage.getItem('amaGPTkey');


        if (!apiKey) {
            document.querySelector('#response').innerHTML = `<span style="color: red;">Du måste lagra en API nyckel, kolla settings!</span>`;
            return;
        }

        const apiUrl = `https://openai-ama-api-fw-teaching.rahtiapp.fi/?api_key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        });

        const responseData = await response.json();
        const answer = responseData.answer;


        document.querySelector('#response').innerHTML = `<div class="input-group form-control mb-3 gptAns">${answer}</div>`;
    } catch (error) {
        console.error('Error sending question:', error);
        document.querySelector('#response').innerHTML = `<span style="color: red;">Fick inte kontakt med GPT</span>`;
    }
}

// Keyhandlers 

document.addEventListener('DOMContentLoaded', () => {

    const saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', () => {

        const weatherApiKeyInput = document.querySelector('#weatherApiKey');
        const amaGPTkeyInput = document.querySelector('#gptKey');
        const todoAPIkeyInput = document.querySelector('#apiKey');

        const weatherApiKey = weatherApiKeyInput.value
        const amaGPTkey = amaGPTkeyInput.value
        const todoAPIkey = todoAPIkeyInput.value

        if (weatherApiKey === '' || amaGPTkey === '' || todoAPIkey === '') {
            alert('Lagra alla nycklarna samtidigt för smidig surfning!');
            return;
        }

        localStorage.setItem('weatherApiKey', weatherApiKey);
        localStorage.setItem('amaGPTkey', amaGPTkey);
        localStorage.setItem('todoAPIkey', todoAPIkey);

        alert('Tack för att du lagrade nycklarna!');

        setTimeout(() => {
            location.reload();
        }, 500);
    });

    const weatherApiKey = localStorage.getItem('weatherApiKey');
    const amaGPTkey = localStorage.getItem('amaGPTkey');
    const todoAPIkey = localStorage.getItem('todoAPIkey');

    const weatherKey = document.querySelector('#weatherApiKey');
    const gptKey = document.querySelector('#gptKey');
    const APIkey = document.querySelector('#apiKey');

    if (weatherApiKey) {
        weatherKey.value = weatherApiKey;
    }

    if (amaGPTkey) {
        gptKey.value = amaGPTkey;
    }

    if (todoAPIkey) {
        APIkey.value = todoAPIkey;
    }
});

// TODO API FUNKTIONALITET

//GET TODOs

const apiURL = 'https://vm2208.kaj.pouta.csc.fi:8501';

const todoAPIKey = localStorage.getItem('todoAPIkey');

async function fetchTodos() {
    const response = await fetch(`${apiURL}/todos`, {
        method: 'GET',
        headers: {
            'Authorization': todoAPIKey
        }
    });
    const todos = await response.json();
    
    const todoList = document.getElementById('todo-list');

    
    todos.forEach((todo) => {
        
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    
        
        const titleClass = todo.done ? 'text-decoration-line-through' : '';
    
        
        listItem.innerHTML = `
        <div class="d-flex align-items-center justify-content-between w-100">
        <div class="d-flex align-items-center">
            <h5 class="card-title me-3 ${titleClass}">${todo.title}</h5>
            <span class="badge ${getCategoryColor(todo.category_name)}">${todo.category_name}</span>
        </div>
        <div class="d-flex align-items-center">
            <button type="button" class="btn btn-secondary patch-btn border-0 bg-transparent ${todo.done ? 'd-none' : ''}">
                <i class="bi bi-check-circle-fill text-dark"></i>
            </button> 
            <button type="button" class="btn btn-secondary delete-btn border-0 bg-transparent">
                <i class="bi bi-trash-fill text-dark"></i>
            </button>    
           ${todo.done ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-x-circle-fill text-danger"></i>'}
        </div>

    </div>
    `;
    
        todoList.appendChild(listItem);

        const deleteButton = listItem.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            deleteTodo(todo.id);
            });

        const patchButton = listItem.querySelector('.patch-btn');
        patchButton.addEventListener('click', () => {
            patchTodo(todo.id);
            });
    });
}


// DELETE TODOs
async function deleteTodo(todoID) {
    const confirmDelete = confirm("Är du säker att du vill radera?");
    if (!confirmDelete) {
        return;
    }

    const response = await fetch(`${apiURL}/todos/${todoID}`, {
        method: 'DELETE',
    });
    const responseData = await response.json();

    alert(responseData.msg);

    
    setTimeout(() => {
        window.location.reload();
    }, 200); 
}

// PATCH TODOs

async function patchTodo(todoID) {
   
    const response = await fetch(`${apiURL}/todos/${todoID}`, {
        method: 'PATCH',
    });
    const responseData = await response.json();

    
    setTimeout(() => {
        window.location.reload();
    }, 200);
}

// POSTA NYA TODOs

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('postTodo');

    sendBtn.addEventListener('click', async () => {
        const title = document.getElementById('toDoTitle').value;
        const category = document.getElementById('categorySelect').value;

        if (!title || !category) {
            alert('Fyll båda');
            return; 
        }

        
        const data = {
            title: title,
            category_id: category
        };

        try {
            
            const response = await fetch(`${apiURL}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': todoAPIKey
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            alert(responseData.msg);
            setTimeout(() => {
                window.location.reload();
            }, 200); 
        } catch (error) {
            console.error('Error:', error);
        }
    });
});


// TODO STYLING MED JS

const categoryColors = {
    'Hem': 'bg-primary',
    'Jobb': 'bg-danger',
    'Hobby': 'bg-warning',
    'Annat': 'bg-info'
};

function getCategoryColor(categoryName) {
    
    if (categoryName in categoryColors) {
        return categoryColors[categoryName];
    } else {
        
        return 'bg-gray';
    }
}




// Kalla alla metoder i början

document.addEventListener('DOMContentLoaded', () => {
    quoteFetch();
    ipFetch();
    fetchGeo();
    dispRates(euro, trgCur);
    fetchTodos();
});