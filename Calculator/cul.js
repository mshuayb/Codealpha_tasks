/* --- CALCULATOR LOGIC --- */
class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0' || this.shouldResetScreen) return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (this.shouldResetScreen) { this.currentOperand = ''; this.shouldResetScreen = false; }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') { this.currentOperand = number.toString(); return; }
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') this.compute();
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = ''; 
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': 
                if (current === 0) { alert("Cannot divide by zero"); this.clear(); this.updateDisplay(); return; }
                computation = prev / current; 
                break;
            default: return;
        }
        this.currentOperand = Math.round(computation * 100000000) / 100000000;
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay = isNaN(integerDigits) ? '' : integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        return decimalDigits != null ? `${integerDisplay}.${decimalDigits}` : integerDisplay;
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        this.previousOperandTextElement.innerText = this.operation != null 
            ? `${this.getDisplayNumber(this.previousOperand)} ${this.operation}` : '';
    }
}

/* --- VISUAL EFFECTS --- */

// 3D Tilt Effect (Adjusted for larger card)
const card = document.getElementById('tilt-card');
const container = document.body;

container.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 768) return;
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25; // Slightly less sensitive
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

container.addEventListener('mouseleave', () => {
    card.style.transition = "all 0.5s ease";
    card.style.transform = `rotateY(0deg) rotateX(0deg)`;
});

// Ripple Effect
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
}

/* --- INITIALIZATION --- */
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-action="equal"]');
const deleteButton = document.querySelector('[data-action="delete"]');
const allClearButton = document.querySelector('[data-action="clear"]');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

const attachListeners = (buttons, type) => {
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            createRipple(e);
            if (type === 'number') calculator.appendNumber(button.innerText);
            else if (type === 'operation') calculator.chooseOperation(button.innerText);
            else if (type === 'action') {
                const action = button.dataset.action;
                if (action === 'clear') calculator.clear();
                if (action === 'delete') calculator.delete();
                if (action === 'equal') calculator.compute();
            }
            calculator.updateDisplay();
        });
    });
};

attachListeners(numberButtons, 'number');
attachListeners(operationButtons, 'operation');
attachListeners([equalsButton, deleteButton, allClearButton], 'action');

// Keyboard
document.addEventListener('keydown', (e) => {
    let key = e.key;
    const highlight = (text) => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText === text);
        if (btn) { btn.click(); btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 100); }
    };
    if ((key >= '0' && key <= '9') || key === '.') highlight(key);
    if (key === '+' || key === '-') highlight(key);
    if (key === '*') highlight('×');
    if (key === '/') { e.preventDefault(); highlight('÷'); }
    if (key === 'Enter' || key === '=') { e.preventDefault(); highlight('='); }
    if (key === 'Backspace') highlight('DEL');
    if (key === 'Escape') highlight('AC');
});