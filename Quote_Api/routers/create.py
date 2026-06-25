from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import (
    APSPGQuoteRecord, APSPGQuoteProductQuotes,
    APSPGQuoteChildProductQuotes, APSPGQuoteUser
)
from schemas import (
    RecordCreate, ProductQuoteCreate, ChildProductQuoteCreate,
    QuoteRecordOut, ProductQuoteOut, ChildProductQuoteOut, RecordWithProducts
)
from auth import get_current_user

router = APIRouter(prefix="/api/create", tags=["Create"])


def generate_child_item() -> int:
    return int(datetime.now().strftime("%Y%m%d%H%M%S"))


# ──────────── Record ────────────

@router.post("/record", response_model=QuoteRecordOut)
def create_record(payload: RecordCreate, db: Session = Depends(get_db),
                  current_user: APSPGQuoteUser = Depends(get_current_user)):
    existing = db.query(APSPGQuoteRecord).filter(
        APSPGQuoteRecord.QuoteReference == payload.QuoteReference
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"QuoteReference '{payload.QuoteReference}' already exists")

    record = APSPGQuoteRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/record/{quote_reference}", response_model=RecordWithProducts)
def get_record_with_products(quote_reference: str, db: Session = Depends(get_db),
                             current_user: APSPGQuoteUser = Depends(get_current_user)):
    record = db.query(APSPGQuoteRecord).filter(
        APSPGQuoteRecord.QuoteReference == quote_reference
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    products = db.query(APSPGQuoteProductQuotes).filter(
        APSPGQuoteProductQuotes.QuoteReference == quote_reference
    ).all()

    all_children = []
    for p in products:
        children = db.query(APSPGQuoteChildProductQuotes).filter(
            APSPGQuoteChildProductQuotes.ChildItem == p.ChildItem
        ).all()
        all_children.extend(children)

    return RecordWithProducts(
        record=QuoteRecordOut.model_validate(record),
        products=[ProductQuoteOut.model_validate(p) for p in products],
        children=[ChildProductQuoteOut.model_validate(c) for c in all_children],
    )


# ──────────── Product Quotes ────────────

@router.post("/record/{quote_reference}/product", response_model=ProductQuoteOut)
def create_product(quote_reference: str, payload: ProductQuoteCreate,
                   db: Session = Depends(get_db),
                   current_user: APSPGQuoteUser = Depends(get_current_user)):
    record = db.query(APSPGQuoteRecord).filter(
        APSPGQuoteRecord.QuoteReference == quote_reference
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    child_item = generate_child_item()
    product = APSPGQuoteProductQuotes(
        QuoteReference=quote_reference,
        ChildItem=child_item,
        **payload.model_dump(),
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/product/{product_id}", response_model=ProductQuoteOut)
def update_product(product_id: int, payload: ProductQuoteCreate,
                   db: Session = Depends(get_db),
                   current_user: APSPGQuoteUser = Depends(get_current_user)):
    product = db.query(APSPGQuoteProductQuotes).filter(
        APSPGQuoteProductQuotes.Id == product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, val in payload.model_dump().items():
        setattr(product, key, val)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/product/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db),
                   current_user: APSPGQuoteUser = Depends(get_current_user)):
    product = db.query(APSPGQuoteProductQuotes).filter(
        APSPGQuoteProductQuotes.Id == product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.query(APSPGQuoteChildProductQuotes).filter(
        APSPGQuoteChildProductQuotes.ChildItem == product.ChildItem
    ).delete()
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}


@router.get("/record/{quote_reference}/products", response_model=List[ProductQuoteOut])
def list_products(quote_reference: str, db: Session = Depends(get_db),
                  current_user: APSPGQuoteUser = Depends(get_current_user)):
    products = db.query(APSPGQuoteProductQuotes).filter(
        APSPGQuoteProductQuotes.QuoteReference == quote_reference
    ).all()
    return [ProductQuoteOut.model_validate(p) for p in products]


# ──────────── Child Product Quotes ────────────

@router.post("/product/{product_id}/child", response_model=ChildProductQuoteOut)
def create_child(product_id: int, payload: ChildProductQuoteCreate,
                 db: Session = Depends(get_db),
                 current_user: APSPGQuoteUser = Depends(get_current_user)):
    product = db.query(APSPGQuoteProductQuotes).filter(
        APSPGQuoteProductQuotes.Id == product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    child = APSPGQuoteChildProductQuotes(
        QuoteReference=product.QuoteReference,
        ChildItem=product.ChildItem,
        **payload.model_dump(),
    )
    db.add(child)
    db.commit()
    db.refresh(child)
    return child


@router.put("/child/{child_id}", response_model=ChildProductQuoteOut)
def update_child(child_id: int, payload: ChildProductQuoteCreate,
                 db: Session = Depends(get_db),
                 current_user: APSPGQuoteUser = Depends(get_current_user)):
    child = db.query(APSPGQuoteChildProductQuotes).filter(
        APSPGQuoteChildProductQuotes.Id == child_id
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    for key, val in payload.model_dump().items():
        setattr(child, key, val)
    db.commit()
    db.refresh(child)
    return child


@router.delete("/child/{child_id}")
def delete_child(child_id: int, db: Session = Depends(get_db),
                 current_user: APSPGQuoteUser = Depends(get_current_user)):
    child = db.query(APSPGQuoteChildProductQuotes).filter(
        APSPGQuoteChildProductQuotes.Id == child_id
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    db.delete(child)
    db.commit()
    return {"message": "Child deleted"}


@router.get("/product/{product_id}/children", response_model=List[ChildProductQuoteOut])
def list_children(product_id: int, db: Session = Depends(get_db),
                  current_user: APSPGQuoteUser = Depends(get_current_user)):
    product = db.query(APSPGQuoteProductQuotes).filter(
        APSPGQuoteProductQuotes.Id == product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    children = db.query(APSPGQuoteChildProductQuotes).filter(
        APSPGQuoteChildProductQuotes.ChildItem == product.ChildItem
    ).all()
    return [ChildProductQuoteOut.model_validate(c) for c in children]
