const formSearch = document.querySelector(".form-search"),
    inputCitiesFrom = formSearch.querySelector(".input__cities-from"),
    dropdownCitiesFrom = formSearch.querySelector(".dropdown__cities-from"),
    inputCitiesTo = formSearch.querySelector(".input__cities-to"),
    dropdownCitiesTo = formSearch.querySelector(".dropdown__cities-to"),
    inputDateDepart = formSearch.querySelector(".input__date-depart"),
    submitButton = formSearch.querySelector(".button__search"),
    cheapestTicket = document.getElementById("cheapest-ticket"),
    otherCheapTickets = document.getElementById("other-cheap-tickets"),
    closeButton = document.getElementsByClassName("close")[0],
    errorBox = document.getElementById("errorBox"),
    mainContent = document.getElementById("main-content");


// cities data

const citiesApi = "dataBase/cities.json",
    proxy = "https://cors-anywhere.herokuapp.com/",
    API_KEY = "dd849c1d50d460a749fb1b93592dd733",
    calendar = "https://min-prices.aviasales.ru/calendar_preload",
    MAX_COUNT = 10; //number of otherTickets cards on the page

let city = [];
let userInput = {
    from: null,
    to: null,
    date: null
};

//functions

const getData = (url, callback, reject = console.error) => {  //"callback" function here is a reference to getData (data) function
    const request = new XMLHttpRequest();

    request.open("GET", url);

    request.addEventListener("readystatechange", () => {
        if (request.readyState !== 4) return; // завершение работы фукнции

        if (request.status === 200) {
            callback(request.response);
        } else {
            reject(request.status);
        }
    });

    request.send(); //allows us to use acquired data
};



const showCity = (input, list) => {

    list.textContent = "";

    if (input.value !== "") {

        const filterCity = trace(city, "en").filter(({ name }) => {    //gets a callback function
            const fixItem = name.toLowerCase();

            return fixItem.startsWith(input.value.toLowerCase());
        });

        filterCity.forEach(({ name, iata }) => {
            const li = document.createElement("li");
            li.classList.add("dropdown__city");
            li.dataset["iata"] = iata;
            li.textContent = name;
            list.append(li);
        });

    }

};

const handlerCity = (event, input, list) => {
    const target = event.target;
    if (target.tagName.toLowerCase() === "li") {
        input.value = target.textContent;
        list.textContent = "";
    }
};

const trace = (data_array, nestedKey) => {
    let cityArray = [];

    for (let i = 0; i < data_array.length; i++) {
        const arrayItem = data_array[i];
        for (let key in arrayItem) {
            let nestedItem = arrayItem[key];

            if (typeof nestedItem === "object" && nestedItem && nestedKey in nestedItem) {
                let cityObject = {
                    name: nestedItem[nestedKey],
                    iata: arrayItem["code"]
                };
                cityArray.push(cityObject);

            }
        }

    }
    return cityArray;
};

const getCityName = (iata) => {
    const objCity = city.find((item) => item.code === iata);

    return objCity.name_translations.en;
};

const getDate = (date) => {
    return new Date(date).toLocaleString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getChanges = (num) => {
    if (num) {
        return num === 1 ? "One change" : "Two changes";
    } else {
        return "No changes";
    }

};

const getLinkAviasales = (data) => {
    let link = "https://www.aviasales.ru/search/";

    link += data.origin;

    const date = new Date(data.depart_date);

    const day = date.getDate();

    link += day < 10 ? "0" + day : day;

    const month = date.getMonth() + 1;

    link += month < 10 ? "0" + month : month;

    link += data.destination;

    link += "1";

    return link;
};

const createCard = (data) => {
    const ticket = document.createElement("article");
    ticket.classList.add("ticket");

    let deep = "";

    if (data) {
        deep = `
        <h3 class="agent">${data.gate}</h3>
        <div class="ticket__wrapper">
	        <div class="left-side">
		        <a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Buy for ${data.value}₽</a>
	        </div>
	        <div class="right-side">
		        <div class="block-left">
			        <div class="city__from">Departure from:
                        <br>
				        <span class="city__name">${getCityName(data.origin)}</span>
			        </div>
			        <div class="date">${getDate(data.depart_date)}</div>
		        </div>
		        <div class="block-right">
			        <div class="changes">${getChanges(data.number_of_changes)}</div>
			        <div class="city__to">Destination:
                        <br>
				        <span class="city__name">${getCityName(data.destination)}</span>
			        </div>
		        </div>
	        </div>
        </div>
        `;
    } else {
        deep = "<h3>Unfortunately, there are no tickets for the requested date</h3>";
    }

    ticket.insertAdjacentHTML("afterbegin", deep);


    return ticket;

};

const renderCheapDay = (cheapTicket) => {
    cheapestTicket.style.display = "block";
    cheapestTicket.innerHTML = "<h2>Самый дешевый билет на выбранную дату</h2>";
    const ticket = createCard(cheapTicket[0]);
    cheapestTicket.append(ticket);
};

const renderCheapYear = (cheapTicket) => {
    otherCheapTickets.style.display = "block";
    otherCheapTickets.innerHTML = "<h2>Самые дешевые билеты на другие даты</h2>";

    for (let i = 0; i < cheapTicket.length && i < MAX_COUNT; i++) {
        const ticket = createCard(cheapTicket[i]);
        otherCheapTickets.append(ticket);
    }
};


const renderTickets = (data, date) => {
    const cheapTicket = JSON.parse(data).best_prices;

    cheapTicket.sort((firstTicket, nextTicket) => {
        return firstTicket.value - nextTicket.value;
    })

    const cheapTicketDay = cheapTicket.filter((item) => {
        return item.depart_date === date;
    });

    renderCheapYear(cheapTicket);
    renderCheapDay(cheapTicketDay);
};


const getTickets = (url, callback, reject = console.error) => {
    const request = new XMLHttpRequest();
    let params = "origin=" + encodeURIComponent(userInput.from) +
        "&destination=" + encodeURIComponent(userInput.to) + "&depart_date=" +
        encodeURIComponent(userInput.date) + "&one_way=true" + "&token=" + API_KEY;
    request.open("GET", url + "/submit?" + params, true);
    request.onreadystatechange = () => {
        if (request.readyState !== 4) return;

        if (request.status === 200) {
            callback(request.response);
        } else {
            reject(request.status);
        }
    }
    request.send();
};

const showError = (message) => {
    let closeButtonHtml = `<span class="close">&times;</span>`;
    errorBox.insertAdjacentHTML("beforeend", message);
    errorBox.insertAdjacentHTML("afterbegin", closeButtonHtml);
    errorBox.style.display = "flex";
    errorBox.classList.add("error-box-onclick");
    mainContent.classList.add("main-content-onclick");
};

const closeWindow = () => {
    errorBox.innerHTML = "";
    mainContent.classList.remove("main-content-onclick");
    errorBox.style.display = "none";
};

//event handlers

inputCitiesFrom.addEventListener("input", () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener("input", () => {
    showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener("click", (event) => {
    handlerCity(event, inputCitiesFrom, dropdownCitiesFrom);
    userInput.from = event.target.dataset["iata"];

});


dropdownCitiesTo.addEventListener("click", (event) => {
    handlerCity(event, inputCitiesTo, dropdownCitiesTo);
    userInput.to = event.target.dataset["iata"];
});

inputDateDepart.addEventListener("change", (event) => {
    userInput.date = event.target.value;
});

submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (userInput.from && userInput.to && userInput.date) {

        getTickets(calendar, (data) => {
            renderTickets(data, userInput.date);

        }, (error) => {
            let errorMessage = `<span>No flights for this destination</span>`;
            showError(errorMessage);
            console.error("Error", error);
        });
    } else if (inputCitiesFrom.value !== "" || inputCitiesTo.value !== "") {
        let errorMessage = `<span>Enter correct city name</span>`;
        showError(errorMessage);
    } else {
        let errorMessage = `<span>Fill in all fields</span>`;
        showError(errorMessage);
    }

    formSearch.reset();
    userInput.from = null;
    userInput.to = null;
});

closeButton.addEventListener("click", () => {
    closeWindow();

});

window.addEventListener("click", () => {
    closeWindow();
});


//function calls/triggers

getData(citiesApi, (data) => {
    city = JSON.parse(data);
});