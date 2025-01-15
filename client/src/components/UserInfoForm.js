import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import CustomSelect from './CustomSelect';
import { AuthService } from '../services/AuthService';
import { HealthService } from '../services/HealthService';
import { useNavigate } from 'react-router-dom';

import '../styles/DataForm.css';
import '../styles/Background.css';
// import { camelToTitle } from '../functions/case_functions';

function UserInfoForm() {
  const navigate = useNavigate();
  
  // Define the form fields
  const FORM_FIELDS = {
    weight: { type: 'number', label: 'Weight', unit: 'kg' },
    height: { type: 'number', label: 'Height', unit: 'cm' },
    age: { type: 'number', label: 'Age', unit: '' },
    dietType: { type: 'select', label: 'Diet Type', options: ['Vegetarian', 'Vegan', 'Keto', 'Other'] },
    activityLevel: { type: 'select', label: 'Activity Level', options: ['Sedentary', 'Lightly active', 'Moderately active', 'Very active'] },
    fitnessExperience: { type: 'select', label: 'Fitness Experience', options: ['Never', 'Beginner', 'Intermediate', 'Advanced'] },
    mealFrequency: { type: 'select', label: 'Meal Frequency', options: ['2-3 meals', '3-5 meals', '6+ meals'] },
    sleepHours: { type: 'number', label: 'Sleep Hours', unit: 'hours' },
    goal: { type: 'text', label: 'Goal' },
  };

  // Generate initial user data from FORM_FIELDS
  const initialUserData = Object.keys(FORM_FIELDS).reduce((acc, key) => {
    acc[key] = '';
    return acc;
  }, {});

  // Use the generated initial state
  const [userData, setUserData] = useState(initialUserData);

  const [step, setStep] = useState(0); // used to check which step is currently on
  const [handlingSubmit, setHandlingSubmit] = useState(false); // used to check if is currently handling submit or not...

  // intialize the inputRefs
  const inputRefs = useRef([]);

  const totalSteps = Object.keys(userData).length;
  
  // check if the current step is the last step
  const isLastStep = step === totalSteps - 1;
  
  // load the user name
  const [userName, setUserName] = useState('');
  useEffect(() => {
    async function loadUserName() {
      const user = await AuthService.getUser();
      if (user) {
        setUserName(user.name);
      }
      else {
        navigate("/logout");
      }
    }
    loadUserName();
  }, [navigate]);

  const backStep = useCallback(() => {
    if (step > 0) setStep(prev => prev - 1);
  }, [step]);

  // Initialize error state
  const [errors, setErrors] = useState({});

  // Handle the submit of the form
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (handlingSubmit) return;
    
    try {
      setHandlingSubmit(true);
      const response = await HealthService.healthInfo(userData);
      if (!response.success) throw new Error(response.message);
      navigate('/calendar');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setHandlingSubmit(false);
    }
  }, [userData, handlingSubmit, navigate]);

  const nextStep = useCallback(() => {
    if (step < totalSteps - 1) {
        const currentKey = Object.keys(userData)[step];
        const currentValue = userData[currentKey];
        
        if (!currentValue) {
            alert(`Please fill out: ${currentKey}`);
            return;
        }

        setStep(prev => prev + 1);

        setTimeout(() => {
            inputRefs.current[step + 1]?.focus();
        }, 10);
    }
  }, [step, userData, totalSteps]);

  useEffect(() => {
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (isLastStep) {
                document.querySelector('.submit')?.focus();
            } else {
                nextStep();
            }
        } else if (e.key === "Escape") {
            backStep();
        }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isLastStep, nextStep, backStep]);
  
  // Validate the health info fields input by the user
  const validateField = (name, value) => {
    switch (name) {
      case 'weight':
        return value >= 0 && value < 300;
      case 'height':
        return value >= 0 && value < 300;
      case 'age':
        return value >= 0 && value < 150;
      default:
        return true;
    }
  };

  // Handle the change of the input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!validateField(name, value)) {
      return;
    }
    setUserData({ ...userData, [name]: value });
  };

  // Handle the change of the select fields
  const handleSelectChange = (name, value) => {
    setUserData({ ...userData, [name]: value });
  };

  // Render the form
  return (
    <>
      <div className="bg bg-dataform"></div>
      <form onSubmit={handleSubmit} className='user-info-form'>
        {step === 0 && <h1>Hi, {userName || 'Guest'}!</h1>}
        <h1 className="question">
          {FORM_FIELDS[Object.keys(userData)[step]].label}?
        </h1>
        {FORM_FIELDS[Object.keys(userData)[step]].unit && (
          <p className='info'>
            (in {FORM_FIELDS[Object.keys(userData)[step]].unit})
          </p>
        )}
        
        <p className="count" style={{marginTop: "20px"}}>
          <span>{step + 1} </span>/{Object.keys(userData).length}
        </p>
        <div className="input-field-container">
          {Object.keys(userData).map((key, index) => {
            const field = FORM_FIELDS[key];
            
            if (field.type === 'select') {
              return (
                <CustomSelect
                  key={key}
                  title={`Select ${field.label}`}
                  values={field.options}
                  value={userData[key]}
                  onChange={(selectedValue) => handleSelectChange(key, selectedValue)}
                  placeholder={`Select ${field.label}`}
                  style={{ display: step === index ? 'block' : 'none' }}
                />
              );
            }

            return (
              <input
                key={key}
                ref={(el) => (inputRefs.current[index] = el)}
                type={field.type}
                name={key}
                value={userData[key]}
                onChange={handleChange}
                placeholder={`Enter ${field.label}`}
                style={{
                  display: step === index ? 'block' : 'none',
                }}
              />
            );
          })}
        </div>
        <div className="button-group">
          <button
            type="button"
            className="action back"
            style={{ visibility: step > 0 ? 'visible' : 'hidden' }}
            onClick={backStep}
          >
            Back
          </button>
          {step < totalSteps - 1 ? (
            <button
              type="button"
              className="action next"
              onClick={nextStep}
            >
              Next
            </button>
          ) : null}
        </div>
        
        {/* Submit button, only displayed when on the last step */}
        {step === totalSteps - 1 && (
          <button
            type="submit"
            className="submit"
            disabled={handlingSubmit}
          >
            {handlingSubmit ? 'Submitting...' : 'Submit'}
          </button>
        )}

        {/* Display error messages */}
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}
      </form>
      <Link to="/" className="homepage-button">
        Menu
      </Link>
    </>
  );
}

export default UserInfoForm;