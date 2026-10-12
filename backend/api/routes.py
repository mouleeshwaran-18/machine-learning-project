import io
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import pandas as pd

from services.analytics_service import CricketAnalyticsService

router = APIRouter()
service = CricketAnalyticsService()

class AnalyzeCareerRequest(BaseModel):
    algorithm: str = "hdbscan"
    scaler_type: str = "robust"
    params: Optional[Dict[str, Any]] = None
    feature_list: Optional[List[str]] = None

class AnalyzePhaseRequest(BaseModel):
    algorithm: str = "hdbscan"
    scaler_type: str = "robust"
    params: Optional[Dict[str, Any]] = None
    min_balls: int = 15

class CompareRequest(BaseModel):
    track: str = "career"
    scaler_type: str = "robust"

@router.get("/datasets/info")
def get_datasets_info():
    try:
        return service.get_dataset_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload/career")
async def upload_career_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        service.set_career_dataset(df)
        return {
            "message": "Career batting dataset uploaded successfully.",
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

@router.post("/upload/ballbyball")
async def upload_ballbyball_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        service.set_ball_by_ball_dataset(df)
        return {
            "message": "Ball-by-ball dataset uploaded successfully.",
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

@router.post("/analyze/career")
def analyze_career(req: AnalyzeCareerRequest):
    try:
        results = service.analyze_career(
            algorithm=req.algorithm,
            scaler_type=req.scaler_type,
            params=req.params or {},
            feature_list=req.feature_list
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/analyze/phasewise")
def analyze_phasewise(req: AnalyzePhaseRequest):
    try:
        results = service.analyze_phasewise(
            algorithm=req.algorithm,
            scaler_type=req.scaler_type,
            params=req.params or {},
            min_balls=req.min_balls
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/compare")
def compare_algorithms(req: CompareRequest):
    try:
        return service.compare_algorithms(track=req.track, scaler_type=req.scaler_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/player/{player_name}")
def get_player_profile(player_name: str):
    try:
        profile = service.get_player_profile(player_name)
        if not profile.get("found"):
            raise HTTPException(status_code=404, detail=profile.get("message"))
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/csv")
def export_csv(track: str = Query("career", pattern="^(career|phasewise)$")):
    try:
        csv_data = service.export_results_csv(track=track)
        filename = f"cricket_clusters_{track}.csv"
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sample-template/{dataset_type}")
def get_sample_template(dataset_type: str):
    if dataset_type == "career":
        content = "Player,Mat,Inns,NO,Runs,HS,Ave,BF,SR,100,50,4s,6s\nVirat Kohli,292,280,44,13848,183,58.67,14810,93.5,50,72,1294,151\nRohit Sharma,262,254,36,10709,264,49.12,11665,91.8,31,55,1001,323\n"
        filename = "sample_career_template.csv"
    elif dataset_type == "ballbyball":
        content = "match_id,inning,over,ball,batter,bowler,batter_runs,extra_runs,wide_runs,noball_runs,total_runs,is_wicket,player_dismissed\nMATCH_1001,1,1,1,Virat Kohli,Jasprit Bumrah,4,0,0,0,4,0,\nMATCH_1001,1,1,2,Virat Kohli,Jasprit Bumrah,0,0,0,0,0,0,\n"
        filename = "sample_ballbyball_template.csv"
    else:
        raise HTTPException(status_code=400, detail="Unknown dataset type")

    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
