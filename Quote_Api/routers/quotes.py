from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional, List
from database import get_db
from models import (
    APSPGQuoteRecord, APSPGQuoteProductQuotes,
    APSPGQuoteChildProductQuotes, APSPGQuoteUser
)
from schemas import (
    SearchRequest, SearchResponse, SearchResultItem,
    QuoteRecordOut, ProductQuoteOut, ChildProductQuoteOut
)
from auth import get_current_user

router = APIRouter(prefix="/api/quotes", tags=["Quotes"])


@router.post("/search", response_model=SearchResponse)
def search_quotes(req: SearchRequest, db: Session = Depends(get_db), current_user: APSPGQuoteUser = Depends(get_current_user)):
    query = (
        db.query(APSPGQuoteProductQuotes)
        .join(APSPGQuoteRecord, APSPGQuoteRecord.QuoteReference == APSPGQuoteProductQuotes.QuoteReference)
    )

    if req.fs_number:
        fs_values = [f.strip() for f in req.fs_number.split("*") if f.strip()]
        if fs_values:
            filters = [APSPGQuoteProductQuotes.FSNumber.like(f"%{v}%") for v in fs_values]
            query = query.filter(or_(*filters))

    if req.rating:
        query = query.filter(APSPGQuoteProductQuotes.Rating.like(f"%{req.rating}%"))
    if req.size:
        query = query.filter(APSPGQuoteProductQuotes.Size.like(f"%{req.size}%"))
    if req.body_material:
        query = query.filter(APSPGQuoteProductQuotes.BodyMaterial.like(f"%{req.body_material}%"))
    if req.end_connection:
        query = query.filter(APSPGQuoteProductQuotes.EndConnection.like(f"%{req.end_connection}%"))
    if req.quote_reference:
        query = query.filter(APSPGQuoteProductQuotes.QuoteReference.like(f"%{req.quote_reference}%"))

    total = query.count()
    total_pages = max(1, (total + req.page_size - 1) // req.page_size)
    page = min(req.page, total_pages) if total > 0 else 1

    sort_field = req.sort_field or "Id"
    sort_col = getattr(APSPGQuoteProductQuotes, sort_field, APSPGQuoteProductQuotes.Id)
    if req.sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    offset = (page - 1) * req.page_size
    products = query.offset(offset).limit(req.page_size).all()

    items = []
    for p in products:
        record = db.query(APSPGQuoteRecord).filter(
            APSPGQuoteRecord.QuoteReference == p.QuoteReference
        ).first()

        children = db.query(APSPGQuoteChildProductQuotes).filter(
            APSPGQuoteChildProductQuotes.ChildItem == p.ChildItem
        ).all()

        sales_user = db.query(APSPGQuoteUser).filter(
            APSPGQuoteUser.Id == record.SalesName
        ).first() if record else None

        handle_user = db.query(APSPGQuoteUser).filter(
            APSPGQuoteUser.Id == record.HandleById
        ).first() if record else None

        items.append(SearchResultItem(
            record=QuoteRecordOut.model_validate(record) if record else None,
            product=ProductQuoteOut.model_validate(p),
            children=[ChildProductQuoteOut.model_validate(c) for c in children],
            sales_name=sales_user.UserName if sales_user else None,
            user_name=handle_user.UserName if handle_user else None,
        ))

    return SearchResponse(items=items, total=total, page=page, page_size=req.page_size, total_pages=total_pages)


@router.get("/recent", response_model=SearchResponse)
def get_recent_quotes(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: APSPGQuoteUser = Depends(get_current_user)
):
    req = SearchRequest(page=page, page_size=page_size)
    return search_quotes(req, db, current_user)
