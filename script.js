
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
        
        const weatherApiKey = weatherApiKeyInput.value
        const amaGPTkey = amaGPTkeyInput.value
        
        if (weatherApiKey === '' || amaGPTkey === '') {
            alert('Lagra båda nycklarna samtidigt för smidig surfning!');
            return;
        }

        localStorage.setItem('weatherApiKey', weatherApiKey);
        localStorage.setItem('amaGPTkey', amaGPTkey);
        
        alert('Tack för att du lagrade nycklarna!');

        setTimeout(() => {
            location.reload();
        }, 500);
    });

    const weatherApiKey = localStorage.getItem('weatherApiKey');
    const amaGPTkey = localStorage.getItem('amaGPTkey');

    const weatherKey = document.querySelector('#weatherApiKey');
    const gptKey = document.querySelector('#gptKey');

    if (weatherApiKey) {
        weatherKey.value = weatherApiKey;
    }

    if (amaGPTkey) {
        gptKey.value = amaGPTkey;
    }
});


// Kalla alla metoder i början

document.addEventListener('DOMContentLoaded', () => {
    quoteFetch();
    ipFetch();
    fetchGeo();
    dispRates(euro, trgCur);  
});