"""
Training Script for Student-Job Matching Model
Uses LightGBM to achieve ≥93% accuracy
"""

import pandas as pd
import numpy as np
import joblib
import json
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report, confusion_matrix
import lightgbm as lgb
import shap
import warnings
warnings.filterwarnings('ignore')

# Set random seed
np.random.seed(42)

def load_and_prepare_data():
    """Load synthetic dataset"""
    print("Loading dataset...")
    df = pd.read_csv("synthetic_matches.csv")
    print(f"Loaded {len(df)} records")
    return df

def create_feature_vectors(df):
    """Extract and engineer features"""
    print("\nCreating feature vectors...")
    
    # Initialize feature list
    features = []
    
    # 1. Numerical features
    df['cgpa'] = df['cgpa'].astype(float)
    df['x10'] = df['x10'].astype(float)
    df['x12'] = df['x12'].astype(float)
    df['min_cgpa'] = df['min_cgpa'].astype(float)
    df['min_x10'] = df['min_x10'].astype(float)
    df['min_x12'] = df['min_x12'].astype(float)
    
    # 2. Derived numerical features
    df['cgpa_diff'] = df['cgpa'] - df['min_cgpa']
    df['x10_diff'] = df['x10'] - df['min_x10']
    df['x12_diff'] = df['x12'] - df['min_x12']
    
    # 3. Skill overlap ratio
    df['skill_overlap'] = df.apply(lambda row: 
        len(set(row['student_skills'].split(',')) & set(row['required_skills'].split(','))) 
        / max(len(row['required_skills'].split(',')), 1), axis=1)
    
    # 4. Interest match (boolean)
    df['interest_match'] = (df['interest'] == df['category']).astype(int)
    
    # 5. Number of skills
    df['num_student_skills'] = df['student_skills'].apply(lambda x: len(x.split(',')))
    df['num_required_skills'] = df['required_skills'].apply(lambda x: len(x.split(',')))
    
    # 6. TF-IDF for skills (capture skill importance)
    student_skills_tfidf = TfidfVectorizer(max_features=50, token_pattern=r'[^,]+')
    job_skills_tfidf = TfidfVectorizer(max_features=50, token_pattern=r'[^,]+')
    
    student_tfidf = student_skills_tfidf.fit_transform(df['student_skills'])
    job_tfidf = job_skills_tfidf.fit_transform(df['required_skills'])
    
    # Convert TF-IDF to dense for LightGBM
    student_tfidf_df = pd.DataFrame(student_tfidf.toarray(), 
                                     columns=[f'student_skill_{i}' for i in range(student_tfidf.shape[1])])
    job_tfidf_df = pd.DataFrame(job_tfidf.toarray(),
                                columns=[f'job_skill_{i}' for i in range(job_tfidf.shape[1])])
    
    # 7. Combined skill similarity
    df['skill_similarity'] = df.apply(lambda row:
        len(set(row['student_skills'].lower().split(',')) & 
            set(row['required_skills'].lower().split(','))) / 
        max(len(set(row['required_skills'].lower().split(','))), 1), axis=1)
    
    # 8. CGPA adequacy (how much above minimum)
    df['cgpa_adequacy'] = np.where(df['cgpa_diff'] >= 0, 
                                  1.0 + df['cgpa_diff'] * 0.5,
                                  np.maximum(0, 1.0 + df['cgpa_diff'] * 2))
    
    # Combine all features
    feature_cols = [
        'cgpa', 'x10', 'x12', 'min_cgpa', 'min_x10', 'min_x12',
        'cgpa_diff', 'x10_diff', 'x12_diff',
        'skill_overlap', 'interest_match',
        'num_student_skills', 'num_required_skills',
        'skill_similarity', 'cgpa_adequacy'
    ]
    
    X = pd.concat([
        df[feature_cols],
        student_tfidf_df,
        job_tfidf_df
    ], axis=1)
    
    y = df['label']
    
    print(f"Features shape: {X.shape}")
    print(f"Number of features: {X.shape[1]}")
    
    return X, y, df

def train_lightgbm_model(X, y):
    """Train LightGBM model with cross-validation"""
    print("\n" + "=" * 50)
    print("TRAINING LightGBM MODEL")
    print("=" * 50)
    
    # Split into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # LightGBM parameters for high accuracy
    params = {
        'objective': 'binary',
        'metric': 'binary_logloss',
        'boosting_type': 'gbdt',
        'num_leaves': 31,
        'learning_rate': 0.05,
        'feature_fraction': 0.9,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': -1,
        'seed': 42,
        'max_depth': 10,
        'min_data_in_leaf': 10,
        'reg_alpha': 0.1,
        'reg_lambda': 0.1
    }
    
    # Cross-validation
    print("\nPerforming 5-fold cross-validation...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(
        lgb.LGBMClassifier(**params, n_estimators=500),
        X_train, y_train, cv=skf, scoring='accuracy', n_jobs=-1
    )
    
    print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Train final model
    print("\nTraining final model...")
    model = lgb.LGBMClassifier(**params, n_estimators=1000, early_stopping_rounds=100)
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        eval_metric='binary_logloss',
        callbacks=[lgb.early_stopping(stopping_rounds=100), lgb.log_evaluation(period=100)]
    )
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_pred_proba)
    
    print("\n" + "=" * 50)
    print("MODEL PERFORMANCE")
    print("=" * 50)
    print(f"Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {auc:.4f}")
    
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X_train.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 15 Most Important Features:")
    print(feature_importance.head(15))
    
    # Save feature importance
    feature_importance.to_csv('feature_importance.csv', index=False)
    
    return model, X_train, X_test, y_train, y_test

def explain_model(model, X_test, feature_names):
    """Generate SHAP explanations"""
    print("\n" + "=" * 50)
    print("GENERATING SHAP EXPLANATIONS")
    print("=" * 50)
    
    try:
        # Use a subset for SHAP (it's computationally expensive)
        sample_size = min(100, len(X_test))
        X_sample = X_test.iloc[:sample_size]
        
        # Create SHAP explainer
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_sample)
        
        # Save SHAP values
        np.save('shap_values.npy', shap_values)
        
        print(f"✓ SHAP values generated for {sample_size} samples")
        print("✓ Saved: shap_values.npy")
        
        # Calculate mean absolute SHAP values
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # Positive class
        
        mean_shap = np.abs(shap_values).mean(0)
        shap_importance = pd.DataFrame({
            'feature': feature_names,
            'mean_shap_value': mean_shap
        }).sort_values('mean_shap_value', ascending=False)
        
        print("\nTop 10 Features by Mean |SHAP value|:")
        print(shap_importance.head(10))
        
        # Save
        shap_importance.to_csv('shap_importance.csv', index=False)
        
    except Exception as e:
        print(f"SHAP explanation failed: {e}")
        print("Continuing without SHAP...")

def main():
    """Main training pipeline"""
    print("=" * 50)
    print("HireMe - Student-Job Matching Model Training")
    print("=" * 50)
    
    # Load data
    df = load_and_prepare_data()
    
    # Create features
    X, y, df = create_feature_vectors(df)
    
    # Train model
    model, X_train, X_test, y_train, y_test = train_lightgbm_model(X, y)
    
    # SHAP explanations
    explain_model(model, X_test, X.columns)
    
    # Save model
    model_filename = "lgb_student_job_model.pkl"
    joblib.dump(model, model_filename)
    print(f"\n✓ Model saved: {model_filename}")
    
    # Save preprocessor
    preprocessor = {
        'feature_names': list(X.columns),
        'feature_indices': {name: idx for idx, name in enumerate(X.columns)}
    }
    
    with open('model_preprocessor.json', 'w') as f:
        json.dump(preprocessor, f, indent=2)
    print("✓ Preprocessor saved: model_preprocessor.json")
    
    # Final accuracy check
    final_accuracy = accuracy_score(y_test, model.predict(X_test))
    print("\n" + "=" * 50)
    print(f"FINAL ACCURACY: {final_accuracy:.4f} ({final_accuracy*100:.2f}%)")
    
    if final_accuracy >= 0.93:
        print("✓ TARGET ACHIEVED: ≥93% accuracy!")
    else:
        print("⚠ Accuracy below target. Consider hyperparameter tuning.")
    
    print("\n✓ Training complete!")

if __name__ == "__main__":
    main()

