const smallWindowBreakpoint = 576;

//#region states

//#region parent
class WindowState {
    constructor() { }
    setSpanFromScroll(element, hasScrollBar) { colorConsoleLog("Setting parent state span based on scroll", "grey"); }
       
    setFloatingDivStyles(elements) { colorConsoleLog("Setting parent state floating labels", "grey");}
       
    setLabelAfterScroll(event) { colorConsoleLog("Setting parent state label after scrolling", "grey"); }     
}

//#endregion

//#region Children

class SmallWindow extends WindowState {
    constructor() {
        super();// Call the super class constructor so we can use 'this' for fields. 
    }

    setSpanFromScroll(element, hasScrollBar) {
       colorConsoleLog("Setting Small Window span based on scroll", "pink");
    }

    setFloatingDivStyles(elements = document.querySelectorAll('.form-floating')) {
       colorConsoleLog("Setting small Window floating labels", "pink");
        elements.forEach(ele => {
            // Remove float classes
            ele.classList.remove('form-floating');
            let inputId = ele.dataset.inputId;
            //Find Input
            let eleInput = document.getElementById(inputId);
            //Find Label
            let eleLabel = document.querySelector(`label[for="${inputId}"`);           
            // Move labels above Fields
                // Remove current children (inputs and labels)
            ele.removeChild(eleLabel);
            ele.removeChild(eleInput);
                // Append label
            ele.appendChild(eleLabel);
                //Append Input
            ele.appendChild(eleInput);
            // Handle span
                //Find span (if exists);
            let eleSpan = getSpan(inputId)
            if (eleSpan != null) {
                //remove span class
                eleSpan.classList.remove(eleSpan.dataset.class);
                // remove span from ele
                ele.removeChild(eleSpan);
                //Append span if applicable
                ele.appendChild(eleSpan);
            }          
        })
    }

    setLabelAfterScroll(event) { colorConsoleLog("Setting Small Window label after scrolling", "pink");}
        
}

class RegularWindow extends WindowState {
    constructor() {
        super();
    }

    setSpan() {
       colorConsoleLog("Setting Regular Window Span", "blue");
    }

    setSpanFromScroll(element, hasScrollBar) {
       colorConsoleLog("Setting Regular Window span based on scroll", "blue");
        let span = getSpan(element.id);
        if (hasScrollBar) {
            span.classList.add('span-text-count-outside');
            span.setAttribute('data-class', 'span-text-count-outside');
            span.classList.remove('span-text-count-inside');
        } else {
            span.classList.add('span-text-count-inside');
            span.setAttribute('data-class', 'span-text-count-inside');
            span.classList.remove('span-text-count-outside');
        }
    }

    setFloatingDivStyles(elements = document.querySelectorAll('.form-floating')) {
       colorConsoleLog("Setting Regular Window floating labels", "blue");
        elements.forEach(ele => {
            //Add floating class to divs
            ele.classList.add('form-floating');
            let inputId = ele.dataset.inputId;
            //Find Input
            let eleInput = document.getElementById(inputId);
            //Find Label
            let eleLabel = document.querySelector(`label[for="${inputId}"]`);
            // Move labels below Fields
                // Remove current children (inputs and labels) 
            ele.removeChild(eleLabel);
            ele.removeChild(eleInput);
                // Append Input
            ele.appendChild(eleInput);
                //Append Label
            ele.appendChild(eleLabel);
            // handle span
                //Find span (if exists);
            let eleSpan = getSpan(inputId);
            if (eleSpan != null) {               
                //replace span class via dataset
                eleSpan.classList.add(eleSpan.dataset.class);
                // remove span from ele
                ele.removeChild(eleSpan);
                //Append span if applicable
                ele.appendChild(eleSpan);
            }
        })
    }


    setLabelAfterScroll(event) {
       colorConsoleLog("Setting Regular Window label after scrolling", "blue");
        let label = document.querySelector(`label[for="${event.target.id}"`);

        let atTop = event.target.scrollTop == 0;
        if (!atTop) {
            label.innerHTML = "";
        } else {
            label.innerHTML = label.dataset.toggledText;
        }
    }
}

//#endregion

//#endregion

//#region factory
class StateFactory {
    smallBreakpoint
    constructor(smallBreakwidth) { this.smallBreakpoint = smallBreakwidth; }

    getWindow(size) {
        if (size < this.smallBreakpoint) {
            if (this.small) {
               colorConsoleLog("Returning Cached Small From Factory", "purple");
                return this.small;
            }
            else {
               colorConsoleLog("Returning new Small From Factory", "purple");
                //this.small = Object.create(smallWindow);
                this.small = new SmallWindow();
                return this.small;
            }
        }
        else {
            if (this.regular) {
               colorConsoleLog("Returning Cached Regular From Factory", "purple");
                return this.regular;
            }
            else {
               colorConsoleLog("Returning new Regular From Factory", "purple");
                //this.regular = Object.create(regularWindow);
                this.regular = new RegularWindow();
                return this.regular;
            }
        }
    }
}
//#endregion

//#region context
class BMacContext {
    constructor(factory = new StateFactory(smallWindowBreakpoint) , windowState = new WindowState()) {
        this.factory = factory;
        this.windowState = windowState;
        this.floatDivs = document.querySelectorAll('.form-floating');
    }

    setWindow(winWidth) {
       colorConsoleLog("Calling setWindow from Context", "yellow");
        this.windowState = this.factory.getWindow(winWidth);
       colorConsoleLog("Calling setFloatingDivStyles from Context", "yellow");
        this.windowState.setFloatingDivStyles(this.floatDivs);
    }

    setSpanFromScroll(element, hasScrollBar) {
       colorConsoleLog("Calling setSpanFormScroll from Context", "yellow");
        this.windowState.setSpanFromScroll(element, hasScrollBar);
    }

    setLabelAfterScroll(event) {
       colorConsoleLog("Calling setLabelAfterScroll from Context", "yellow");
        this.windowState.setLabelAfterScroll(event);
    }
}
//#endregion

function MonitorTextAreas(StylesStateMachine = new BMacContext()) {
    let tAreas = document.querySelectorAll('.limited-textarea');

    tAreas.forEach(ele => ele.addEventListener('keyup', event => handleKeyUp(event)));
    tAreas.forEach(ele => ele.addEventListener('scroll', event => handleScrolling(event)));

    let handleKeyUp = (e) => {
        let element = e.target;

        StylesStateMachine.setSpanFromScroll(element,checkforScroll(element));
        fillSpan(element);
    }

    let handleScrolling = (event) => {
        StylesStateMachine.setLabelAfterScroll(event);
    }

    let pickTextColor = (remaining, dangerBreak = 0, warningBreak = 50) => {
        if (remaining <= dangerBreak) {
            return "red";
        }
        if (remaining <= warningBreak) {
            return "yellow";
        }
        return "green";
    }

    let fillSpan = (element) => {

        let limit = element.dataset.limit;
        let current = element.value.trim().length;
        let remaining = limit - current;

        let color = pickTextColor(remaining);
        colorConsoleLog(`${current}/${limit}`, color);

        let span = getSpan(element.id);
        span.style.color = color;
        span.innerHTML = `${current}/${limit}`;
    }

    let checkforScroll = (element) => {
        return element.clientHeight < element.scrollHeight;
    }
}

function HandleAnonymousFields(StylesStateMachine = new BMacContext()) {
    let rbsAnonymous = document.querySelectorAll('[name="flexRadioAnonymous"]');

    rbsAnonymous.forEach(ele => ele.addEventListener('click', event => updateFields(event)));

    let updateFields = (e) => {
        let element = e.target;
        let isAnonymous = element.value;
        colorConsoleLog("Is Anonymous: " + isAnonymous);

        let fields = document.querySelectorAll('.anonymous-eligible');

        if (isAnonymous === "true") {
            colorConsoleLog("Anonymous", "red");
            fillFields(fields);
            showAnonWarning();           
        } else {
            colorConsoleLog("Not Anonymous", "green");
            clearFields(fields);
        }
    }

    let clearFields = (elements) => {
        elements.forEach(ele => {
            if (ele.value == ele.dataset.anonymousValue) {
                ele.value = "";
            }
        });
    }

    let fillFields = (elements) => {
        elements.forEach(ele => ele.value = ele.dataset.anonymousValue);
    }

    let showAnonWarning = (id = "MyModal") => {
        colorConsoleLog("Showing Modal");
        openModal(id);
    }
}

function HandleWindowStyles(StylesStateMachine = new BMacContext()) {

    window.addEventListener('load', event => {
        StylesStateMachine.setWindow(window.innerWidth);
    });

    window.addEventListener('resize', event => {
        StylesStateMachine.setWindow(window.innerWidth);
    });
}

function getSpan(inputId) {
    return document.querySelector(`span[for="${inputId}"]`);
}

function getLabel(inputId) {
    return document.querySelector(`label[for="${inputId}"]`);
}

function openModal(id) {
    colorConsoleLog("Opening Modal: " + id, "orange");
    $(`#${id}`).modal('show');
}

function closeModal(id) {
    colorConsoleLog("Closing Modal: " + id, "orange");
    $('#' + id).modal('hide');
}

function colorConsoleLog(message, color = "black") {
    let consoleCSS = `background: #222; color: ${color};`;

    let consoleMessage = `%c${message}`;

    console.log(consoleMessage, consoleCSS);
}

function Initialize() {
    var StateM = new BMacContext();

    MonitorTextAreas(StateM);
    HandleAnonymousFields(StateM);
    HandleWindowStyles(StateM);
}