import { useState } from 'react';
import BaseWidget from './BaseWidget';
import './CalculatorWidget.css';

interface CalculatorWidgetProps {
  onExpand?: () => void;
  isExpanded?: boolean;
  onClose?: () => void;
}

export default function CalculatorWidget({ onExpand, isExpanded, onClose }: CalculatorWidgetProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const executeCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const widgetContent = (
    <div className="calculator-widget-content">
      <div className="calc-display-mini">{display}</div>
      <div className="calc-status">
        {operation && `${previousValue} ${operation}`}
      </div>
    </div>
  );

  const expandedContent = (
    <div className="calculator-expanded">
      <div className="calc-display">{display}</div>
      <div className="calc-buttons">
        <button onClick={clear} className="calc-btn calc-btn-clear">C</button>
        <button onClick={() => performOperation('÷')} className="calc-btn calc-btn-operator">÷</button>
        <button onClick={() => performOperation('×')} className="calc-btn calc-btn-operator">×</button>
        <button onClick={() => setDisplay(display.slice(0, -1) || '0')} className="calc-btn calc-btn-operator">⌫</button>
        
        <button onClick={() => inputNumber('7')} className="calc-btn">7</button>
        <button onClick={() => inputNumber('8')} className="calc-btn">8</button>
        <button onClick={() => inputNumber('9')} className="calc-btn">9</button>
        <button onClick={() => performOperation('-')} className="calc-btn calc-btn-operator">-</button>
        
        <button onClick={() => inputNumber('4')} className="calc-btn">4</button>
        <button onClick={() => inputNumber('5')} className="calc-btn">5</button>
        <button onClick={() => inputNumber('6')} className="calc-btn">6</button>
        <button onClick={() => performOperation('+')} className="calc-btn calc-btn-operator">+</button>
        
        <button onClick={() => inputNumber('1')} className="calc-btn">1</button>
        <button onClick={() => inputNumber('2')} className="calc-btn">2</button>
        <button onClick={() => inputNumber('3')} className="calc-btn">3</button>
        <button onClick={executeCalculation} className="calc-btn calc-btn-equals" style={{gridRow: 'span 2'}}>=</button>
        
        <button onClick={() => inputNumber('0')} className="calc-btn" style={{gridColumn: 'span 2'}}>0</button>
        <button onClick={inputDecimal} className="calc-btn">.</button>
      </div>
    </div>
  );

  return (
    <BaseWidget
      title="Calculator"
      icon="🧮"
      onExpand={onExpand}
      isExpanded={isExpanded}
      onClose={onClose}
      expandedContent={expandedContent}
      className="calculator-widget"
    >
      {widgetContent}
    </BaseWidget>
  );
}
