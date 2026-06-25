from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import (
    APSPGProductType, APSPGTypeDesign, APSPGRating,
    APSPGRaisteamDesignCode, APSPGPipeSize, APSPGBodyMaterial,
    APSPGQuoteSourcingRestriction, APSPGQuoteIndustryCode
)
from schemas import LookupItem

router = APIRouter(prefix="/api/lookup", tags=["Lookup"])


@router.get("/product-types", response_model=List[LookupItem])
def get_product_types(db: Session = Depends(get_db)):
    items = db.query(APSPGProductType).all()
    return [LookupItem(id=i.ProductTypeID, name=i.ProductTypeName) for i in items]


@router.get("/type-designs/{product_type_id}", response_model=List[LookupItem])
def get_type_designs(product_type_id: int, db: Session = Depends(get_db)):
    items = db.query(APSPGTypeDesign).filter(APSPGTypeDesign.ProductTypeID == product_type_id).all()
    return [LookupItem(id=i.TypeDesignID, name=i.TypeDesignName) for i in items]


@router.get("/ratings", response_model=List[LookupItem])
def get_ratings(db: Session = Depends(get_db)):
    items = db.query(APSPGRating).all()
    return [LookupItem(id=i.Id, name=i.Rating) for i in items]


@router.get("/design-codes", response_model=List[LookupItem])
def get_design_codes(db: Session = Depends(get_db)):
    items = db.query(APSPGRaisteamDesignCode).all()
    return [LookupItem(id=i.CodeID, name=i.DesignCode) for i in items]


@router.get("/pipe-sizes", response_model=List[LookupItem])
def get_pipe_sizes(db: Session = Depends(get_db)):
    items = db.query(APSPGPipeSize).all()
    return [LookupItem(id=i.SizeID, name=i.SizeValue) for i in items]


@router.get("/body-materials", response_model=List[LookupItem])
def get_body_materials(db: Session = Depends(get_db)):
    items = db.query(APSPGBodyMaterial).all()
    return [LookupItem(id=i.MaterialID, name=i.MaterialName) for i in items]


@router.get("/sourcing-restrictions", response_model=List[LookupItem])
def get_sourcing_restrictions(db: Session = Depends(get_db)):
    items = db.query(APSPGQuoteSourcingRestriction).all()
    return [LookupItem(id=i.Id, name=i.Title) for i in items]


@router.get("/industry-codes", response_model=List[LookupItem])
def get_industry_codes(db: Session = Depends(get_db)):
    items = db.query(APSPGQuoteIndustryCode).all()
    return [LookupItem(id=i.Id, name=i.Title) for i in items]
