// src/components/citizen/FormStepper.jsx
// React concepts used: Components, Props (steps, currentStep), Lists (steps.map())

import React from 'react';

/**
 * FormStepper — Multi-step wizard progress indicator matching DigiConnect form styling.
 *
 * Props:
 *   steps       {string[]} - Array of step title labels
 *   currentStep {number}   - Active 1-indexed step number
 */
export default function FormStepper({ steps = [], currentStep = 1 }) {
  return (
    <div className="form-stepper" id="formStepper" style={{ marginBottom: 'var(--space-xl)' }}>
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div
            key={label}
            className={`form-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`.trim()}
          >
            <div className="form-step-circle">
              {isCompleted ? (
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNum
              )}
            </div>
            <div className="form-step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
