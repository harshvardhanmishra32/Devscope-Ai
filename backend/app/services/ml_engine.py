import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression

# Local folder to cache serialized model weights
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml_models")
os.makedirs(MODEL_DIR, exist_ok=True)

CLASSIFIER_PATH = os.path.join(MODEL_DIR, "hiring_model.joblib")
REGRESSOR_PATH = os.path.join(MODEL_DIR, "salary_model.joblib")

class MLEngine:
    _hiring_model = None
    _salary_model = None

    @classmethod
    def initialize_models(cls):
        """
        Load trained models from disk. If missing, train online with synthetic data.
        """
        if cls._hiring_model is None or cls._salary_model is None:
            if os.path.exists(CLASSIFIER_PATH) and os.path.exists(REGRESSOR_PATH):
                try:
                    cls._hiring_model = joblib.load(CLASSIFIER_PATH)
                    cls._salary_model = joblib.load(REGRESSOR_PATH)
                except Exception:
                    cls._train_and_save_fallback()
            else:
                cls._train_and_save_fallback()

    @classmethod
    def _train_and_save_fallback(cls):
        """
        Train classification & regression models with synthetic datasets.
        """
        # 1. Hiring Model Data (Features: github_score, resume_score, experience_years, skill_match_ratio)
        # Target: 1 = Hired, 0 = Rejected
        np.random.seed(42)
        n_samples = 200
        
        github_scores = np.random.uniform(50, 100, n_samples)
        resume_scores = np.random.uniform(50, 100, n_samples)
        exp_years = np.random.randint(0, 15, n_samples)
        skill_ratios = np.random.uniform(0.2, 1.0, n_samples)
        
        # Hiring probability logic: higher scores increase likelihood of hiring
        prob = (github_scores * 0.3 + resume_scores * 0.3 + exp_years * 2.0 + skill_ratios * 20.0) / 100.0
        hired = (prob > 0.6).astype(int)
        
        X_hiring = pd.DataFrame({
            "github_score": github_scores,
            "resume_score": resume_scores,
            "experience_years": exp_years,
            "skill_match_ratio": skill_ratios
        })
        
        hiring_clf = RandomForestClassifier(n_estimators=50, random_state=42)
        hiring_clf.fit(X_hiring, hired)
        joblib.dump(hiring_clf, CLASSIFIER_PATH)
        cls._hiring_model = hiring_clf

        # 2. Salary Prediction Data (Features: experience_years, overall_score, skill_count)
        # Target: Salary in USD
        overall_scores = (github_scores + resume_scores) / 2
        skill_counts = np.random.randint(2, 12, n_samples)
        
        # Salary equation: Base 60k + 5k/yr exp + 400/overall_score + 1.5k/skill_count
        salaries = 60000 + (exp_years * 5000) + (overall_scores * 400) + (skill_counts * 1500) + np.random.normal(0, 3000, n_samples)
        
        X_salary = pd.DataFrame({
            "experience_years": exp_years,
            "overall_score": overall_scores,
            "skill_count": skill_counts
        })
        
        salary_reg = LinearRegression()
        salary_reg.fit(X_salary, salaries)
        joblib.dump(salary_reg, REGRESSOR_PATH)
        cls._salary_model = salary_reg

    @classmethod
    def predict_hiring_probability(cls, github_score: int, resume_score: int, experience_years: int, skill_match_ratio: float) -> float:
        """
        Predict probability of matching hiring requirements.
        """
        cls.initialize_models()
        
        X = pd.DataFrame([{
            "github_score": float(github_score),
            "resume_score": float(resume_score),
            "experience_years": float(experience_years),
            "skill_match_ratio": float(skill_match_ratio)
        }])
        
        try:
            probabilities = cls._hiring_model.predict_proba(X)
            # Probability of hiring (class 1)
            return float(probabilities[0][1])
        except Exception:
            # Code-safe math fallback if ML predictions fail
            base_prob = (github_score * 0.35 + resume_score * 0.35 + experience_years * 2.0 + skill_match_ratio * 15.0) / 100.0
            return min(0.99, max(0.05, float(base_prob)))

    @classmethod
    def predict_salary(cls, experience_years: int, github_score: int, resume_score: int, skill_count: int) -> float:
        """
        Predict target salary benchmark.
        """
        cls.initialize_models()
        
        overall_score = (github_score + resume_score) / 2
        X = pd.DataFrame([{
            "experience_years": float(experience_years),
            "overall_score": float(overall_score),
            "skill_count": float(skill_count)
        }])
        
        try:
            prediction = cls._salary_model.predict(X)
            return float(prediction[0])
        except Exception:
            # Code-safe mathematical fallback
            calc_salary = 60000 + (experience_years * 6000) + (overall_score * 450) + (skill_count * 1500)
            return float(calc_salary)
