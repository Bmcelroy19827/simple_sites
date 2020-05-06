let tab= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" //This is here so we can put tabs inside our html

let box = document.querySelector('#notification_box');
let options = document.querySelector('#options');
let selected = document.querySelector(`option[value="${options.value}"]`)
let custom_speech_fields = Array.from(document.querySelectorAll('.custom_speech'));
let lbl_speech = document.querySelector('#lbl_speech');
let min_input = document.querySelector('#min_time');
let max_input = document.querySelector('#max_time');
let green_input = document.querySelector('#when_green');
let yellow_input = document.querySelector('#when_yellow');
let red_input = document.querySelector('#when_red');
let btn_start = document.querySelector('#speech_start');
let btn_end = document.querySelector('#speech_done');
let btn_pause = document.querySelector('#btn_pause');
let btn_results = document.querySelector('#btn_list_results');
let btn_clear = document.querySelector('#btn_clear');
let speak_n = document.querySelector('#speaker');


let counter = 0;
let colors = ['green', 'yellow', 'red'];
let data_green = Number(selected.dataset.green);
let data_yellow = Number(selected.dataset.yellow);
let data_red = Number(selected.dataset.red);
let data_qualify = data_red + 0.5;
let c_time = false;

let timerRunning = false;
let paused = false;
let difference = 0;
let startTime;
let tInterval;
let updatedTime;
let savedTime;
let timer_seconds;

let s_name;
let s_type;
let s_qualified;
let speech_minutes;
let speech_seconds;

let speakers = []
class Speaker {
    constructor(name, speech_type, s_minutes, s_seconds, qualified){
        this.name = name;
        this.speech_type = speech_type;
        this.s_minutes = s_minutes;
        this.s_seconds = s_seconds;
        this.qualified = qualified;
    }

    toString() {
            return `</br>Speaker: ${this.name}</br>${tab}Speech Type: ${this.speech_type}</br>${tab}` +
                    `Time: ${this.s_minutes}m:${this.s_seconds}s</br>${tab}Qualified: ${this.qualified}</br></br>`      
    }
}


let dict = {}


options.onchange = function() {
    // counter++;
    // index = counter % colors.length;
    // changeBoxColor(colors[index]);
    lbl_speech.innerHTML = "";
    if (this.value != 'custom') {
        custom_speech_fields.forEach( field => {
            field.hidden = true;
        });
        c_time = false;
        selected = document.querySelector(`option[value="${this.value}"]`)
        data_green = Number(selected.dataset.green);
        data_yellow = Number(selected.dataset.yellow);
        data_red = Number(selected.dataset.red);
        console.log(`Green: ${data_green}\nYellow: ${data_yellow}\nRed: ${data_red}`);
    }
    else {
        data_green = 0;
        data_yellow = 0;
        data_red = 0;
        c_time = true;
        custom_speech_fields.forEach( field => {
            field.hidden = false;
        });
    }
}

btn_start.onclick = function() {

    if (checkUserData()){
        
        lbl_speech.innerHTML = "Time - 0m:0s";
        box.innerHTML = "";
        changeBoxColor('grey');
        startTimer();
        btn_start.disabled = true;
        btn_end.disabled = false;
        min_input.disabled = true;
        max_input.disabled = true;
        btn_pause.disabled = false;
        btn_pause.value = "Pause";
        speak_n.disabled = true;
        options.disabled = true;
        btn_results.disabled = true;
    }
}

btn_pause.onclick = function() {

    pauseTimer(this);
}

btn_end.onclick = function() {
    // stop timer
    btn_start.disabled = false;
    speak_n.disabled = false;
    btn_end.disabled = true;
    btn_pause.disabled = true;
    btn_pause.value = "Pause";
    min_input.disabled = false;
    max_input.disabled = false;
    options.disabled = false;
    btn_results.disabled = false;

    stopTimer();
    data_green = Number(selected.dataset.green);
    data_yellow = Number(selected.dataset.yellow);
    data_red = Number(selected.dataset.red);

}

btn_clear.onclick = function() {

    for (let key in window.localStorage) {
            // Use a simple regex to see if the key has "toastmaster" in it anywhere", if so we add to the result string
            let myRe = /toastmaster/;
            if (myRe.test(key))
            {
                window.localStorage.removeItem(key);
            }
        }
}

btn_results.onclick = function() {
    changeBoxColor('mediumslateblue');
    results = "";
    for (i = 0; i < speakers.length; i++){
        //We add "toastmaster" to the beginning of the key for the regex later to only retrieve relative entries
        if (speakers[i] !== undefined) {
            if (dict["toastmaster" + speakers[i].name] != null && dict["toastmaster" + speakers[i].name] != undefined) {

                dict["toastmaster" + speakers[i].name] += speakers[i].toString();
            }
            else {

                dict["toastmaster" + speakers[i].name] = speakers[i].toString();

            }
            results += speakers[i].toString();
            delete speakers[i];
        }
    }
    delete speakers;
    //Check to make sure local storage is supported.
    if (typeof(Storage) !== "undefined") {

        results = "";

        for (let key in dict) {

            let value = dict[key];
            console.log(key + " : " + value );

            if (value !== null) {

                console.log("Value not null");
                let saved_v = window.localStorage.getItem(key);

                if (saved_v === null || saved_v === undefined) {
                    saved_v = value;
                }
                else {
                    console.log("Deleting " + key);
                    window.localStorage.removeItem(key);
                    saved_v = saved_v + value;
                }
                console.log("Setting " + key);
                window.localStorage.setItem(key, saved_v);
            }
            delete dict[key];
        }
                     
        for (let key in window.localStorage) {
            // Use a simple regex to see if the key has "toastmaster" in it anywhere", if so we add to the result string
            let myRe = /toastmaster/;
            if (myRe.test(key))
            {
                results += window.localStorage.getItem(key);
            }
        }
    }
    box.innerHTML = results;
    results = "";
    value = null;
    saved_v = null;
}

speak_n.addEventListener('focus', () => lbl_speech.innerHTML = "");

function getSecs(num) {
    return num * 60
}

// A lot of the Timer is from https://medium.com/@olinations/an-accurate-vanilla-js-stopwatch-script-56ceb5c6f45b
function startTimer() {
    if (!timerRunning) {

        startTime = new Date().getTime();
        tInterval = setInterval(getTotalTime, 1);//Run getShowTime every millisecond 
        paused = false;
        timerRunning = true;
    }
}


function pauseTimer(btn) {
    if (!difference) {
        // If getTotalTime never ran then pause button does nothing
    }
    else if (!paused) {
        clearInterval(tInterval);
        savedTime = difference;
        paused = true;
        timerRunning = false;
        btn.value = "Resume";
    }
    else {
        // If there's a difference and the timer was already paused, then clicking again will start timer over.
        startTimer();
        btn.value = "Pause";
    }
}


function stopTimer() {
    clearInterval(tInterval);
    speech_minutes = Math.floor(difference  / (1000 * 60));
    // Take the minutes off with mod operator then divide by ms and round down to get whole seconds
    speech_seconds = Math.floor((difference % (1000 * 60) / 1000));
    lbl_speech.innerHTML = `Time - ${speech_minutes}m:${speech_seconds}s`

    let t_secs = Math.floor(difference / 1000);
    savedTime = 0;
    difference = 0;
    paused = false;
    timerRunning = false

    if (t_secs <= data_max_qualify && t_secs >= data_min_qualify){
        let time_to_p = (data_max_qualify + data_min_qualify) / 2;
        if (data_max_qualify - t_secs <= 10 || t_secs - data_min_qualify <= 10){
            let closeOne = String.fromCodePoint(0x1F605);
            s_qualified = closeOne;
        }
        else if (Math.abs(t_secs - time_to_p) <= 15) {
            let awesome = String.fromCodePoint(0x1F601);
            s_qualified = awesome;
        }
        else {
            let goodJob = String.fromCodePoint(0x1F603);
            s_qualified = goodJob;
        }
        
    }
    else {
        if (t_secs > data_max_qualify) {
            let zipIt = String.fromCodePoint(0x1F910);
            s_qualified = `${zipIt}`;
        }
        else {
            let needMore = String.fromCodePoint(0x1F615);
            s_qualified = `${needMore}`;
        }
    }

    let person = new Speaker(s_name, s_type, speech_minutes, speech_seconds, s_qualified);
    speakers.push(person);
}


function getTotalTime() {

    updatedTime = new Date().getTime();

    if (savedTime) {
        difference = (updatedTime - startTime) + savedTime;
    }
    else {
        difference = updatedTime - startTime;
    }

    timer_seconds = Math.floor(difference / 1000);
    //console.log(timer_seconds); 
    speech_minutes = Math.floor(difference  / (1000 * 60));
    // Take the minutes off with mod operator then divide by ms and round down to get whole seconds
    speech_seconds = Math.floor((difference % (1000 * 60) / 1000));
    lbl_speech.innerHTML = `Time - ${speech_minutes}m:${speech_seconds}s`
    if (timer_seconds >= data_red) {
        changeBoxColor('red');
    }
    else if (timer_seconds >= data_yellow) {
        changeBoxColor('yellow');
    }
    else if (timer_seconds >= data_green) {
        changeBoxColor('green');
    }
}


function checkUserData() {

    if (c_time) {

        if (Number(min_input.value) < 1 ){
            alert("Minimum speech length is 1 minute");
            return false;
        }
        if (Number(min_input.value) > Number(max_input.value)){
            alert("Minimum cannot be greater than the maximum");
            return false;
        }

        data_red = Number(red_input.value);
        data_green = Number(green_input.value);
        data_yellow = Number(yellow_input.value);

        if(data_red == 0 || data_yellow == 0 || data_green == 0){
            alert("Please fill in times for all color values. Cannot use 0 (zero).")
            return false;
        }

        if (data_red < data_green || data_red < data_yellow || data_yellow < data_green){
            alert("The times for color changes need changed (Green is shortest, then yellow, red should be the longest time");
            return false;
        }

        if (data_red > Number(max_input.value)){
            alert("The time for red is greater than the speech max limit");
            return false;
        }

        if (data_green < Number(min_input.value)){
            alert("The time for green is less than teh speech minimum limit");
            return false;
        }

    }

    data_min_qualify = Math.max( 0, data_green - 0.5); 
    data_max_qualify = data_red + 0.5;

    data_green = getSecs(data_green);
    data_yellow = getSecs(data_yellow);
    data_red = getSecs(data_red);
    data_max_qualify = getSecs(data_max_qualify);
    data_min_qualify = getSecs(data_min_qualify);


    s_name = speak_n.value;
    if (s_name == ""){
        s_name = "N/A";
        speak_n.value = "N/A";
    }

    if (c_time) {
        s_type = `Custom (${min_input.value} - ${max_input.value})`;
    }
    else {
        s_type = options.value;
    }
    return true;
}


function changeBoxColor(color){
    box.style.backgroundColor = color;
}