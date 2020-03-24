const formSearch = document.querySelector(".form-search"),
    inputCitiesFrom = document.querySelector(".input__cities-from"),
    dropdownCitiesFrom = document.querySelector(".dropdown__cities-from"),
    inputCitiesTo = document.querySelector(".input__cities-to"),
    dropdownCitiesTo = document.querySelector(".dropdown__cities-to"),
    inputDateDepart = document.querySelector(".input__date-depart"),
    submitButton = document.querySelector(".button__search");


// cities data

const citiesApi = "dataBase/cities.json",
    proxy = "https://cors-anywhere.herokuapp.com/",
    API_KEY = "dd849c1d50d460a749fb1b93592dd733",
    calendar = "http://min-prices.aviasales.ru/calendar_preload";

let city = [];
let userInput = {
    from: null,
    to: null,
    date: null
};

//functions

const getData = (url, callback) => {  //"callback" function here is a reference to getData (data) function
    const request = new XMLHttpRequest();

    request.open("GET", url);

    request.addEventListener("readystatechange", () => {
        if (request.readyState !== 4) return; // завершение работы фукнции

        if (request.status === 200) {
            callback(request.response);
        } else {
            console.error(request.status);
        }
    });

    request.send(); //allows us to use acquired data
};



const showCity = (input, list) => {

    list.textContent = "";

    if (input.value !== "") {

        const filterCity = trace(city, "en").filter(({name}) => {    //gets a callback function
            const fixItem = name.toLowerCase();

            return fixItem.includes(input.value.toLowerCase());
        });

        filterCity.forEach(({name, iata}) => {
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

const loadTickets = () => {
    if (userInput.from && userInput.to && userInput.date) {
       
        getTickets(calendar, (data) => {
            console.log(data);
        })
    } else {
        console.log("fill in all fields");
    }
    
};

const getTickets = (url, callback) => {
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
            console.error(request.status);
        }
    }
    request.send();
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

submitButton.addEventListener("click", loadTickets);

//function calls/triggers
getData(citiesApi, (data) => {
    city = JSON.parse(data);

});

// getData(calendar + "/submit?" + "depart_date=2020-05-25&origin=SVX&destination=KGD&one_way=true&token=" + API_KEY, (data) => {
//     const cheapTicket = JSON.parse(data).best_prices.filter(item => item.depart_date === "2020-05-25")
//     console.log(cheapTicket);
// });



