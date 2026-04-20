from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class FDRequest(BaseModel):
    amount: float
    duration_months: int
    goal: str


@app.get("/")
def read_root():
    return {"message": "Voice Vernacular Finance Coach API is running."}


@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    # Mock intelligent responses based on common demo intents
    msg = req.message.lower()
    
    if "save" in msg and "5000" in msg:
        return {
            "intent": "saving_advice",
            "reply": "To save ₹5000 a month, you should aim to put away ₹166 every day or ₹1250 a week. A great strategy is to set up an automatic transfer to a savings account on your payday. Would you like me to analyze your expenses to see where you can cut back?",
            "actionRequired": None
        }
    
    if "spending" in msg or "spend too much" in msg:
        return {
            "intent": "expense_analysis",
            "reply": "Based on a typical profile, your highest spend categories are usually Rent and Food. Would you like to upload your bank statement so I can give you a personalized breakdown?",
            "actionRequired": "upload_csv"
        }
        
    if "invest" in msg or "fd" in msg or "10000" in msg:
        return {
            "intent": "fd_advice",
            "reply": "Fixed Deposits (FDs) are very safe. If you invest ₹10,000 for 1 year at a 7% interest rate, you will get ₹10,700 at maturity. This means you earn a guaranteed profit of ₹700 without any risk. Should I show you some FD options?",
            "actionRequired": "show_fd"
        }
        
    return {
        "intent": "general",
        "reply": "I'm your AI money coach. You can ask me how to save for a goal, where you're spending too much, or how Fixed Deposits work!",
        "actionRequired": None
    }


@app.post("/api/analyze-expenses")
async def analyze_expenses(file: UploadFile = File(...)):
    # Parse the uploaded CSV
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    
    # Calculate breakdown
    category_totals = df.groupby('Category')['Amount'].sum().to_dict()
    total_spent = sum(category_totals.values())
    
    # Calculate percentages
    breakdown = []
    for cat, amount in category_totals.items():
        percentage = (amount / total_spent) * 100
        breakdown.append({
            "category": cat,
            "amount": float(amount),
            "percentage": float(percentage)
        })
    
    # Sort by amount descending
    breakdown.sort(key=lambda x: x['amount'], reverse=True)
    
    highest_cat = breakdown[0]['category'] if breakdown else "Unknown"
    highest_pct = breakdown[0]['percentage'] if breakdown else 0
    
    insights = f"You spent {highest_pct:.0f}% on {highest_cat} — higher than average. Try to reduce {highest_cat.lower()} expenses to boost your savings."
    
    return {
        "total_spent": total_spent,
        "breakdown": breakdown,
        "insights": insights
    }


@app.post("/api/predict-fd")
def predict_fd(req: FDRequest):
    # Mock FD calculation
    rate = 7.1  # 7.1% annual interest rate mock
    principal = req.amount
    time_years = req.duration_months / 12
    
    # Simple Interest for simplicity in MVP
    interest = (principal * rate * time_years) / 100
    maturity = principal + interest
    
    return {
        "invested_amount": principal,
        "interest_rate_percent": rate,
        "estimated_returns": round(interest, 2),
        "maturity_amount": round(maturity, 2),
        "explanation": f"If you invest ₹{principal:,.0f} for {time_years} years, you will get a guaranteed return of ₹{maturity:,.0f}."
    }
