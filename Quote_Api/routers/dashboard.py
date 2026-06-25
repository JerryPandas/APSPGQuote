from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from typing import Optional, List
from datetime import datetime
from database import get_db
from models import APSPGQuoteProductQuotes, APSPGQuoteRecord, APSPGQuoteUser
from auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    product_type: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: APSPGQuoteUser = Depends(get_current_user)
):
    base_query = db.query(APSPGQuoteProductQuotes).join(
        APSPGQuoteRecord, APSPGQuoteRecord.QuoteReference == APSPGQuoteProductQuotes.QuoteReference
    )

    if product_type:
        base_query = base_query.filter(APSPGQuoteProductQuotes.ProductType == product_type)
    if user_id:
        base_query = base_query.filter(APSPGQuoteRecord.HandleById == user_id)
    elif current_user.Role == "Member":
        base_query = base_query.filter(APSPGQuoteRecord.HandleById == current_user.Id)

    total_quotes = base_query.count()

    monthly_counts = (
        db.query(
            extract("year", APSPGQuoteRecord.DatedIn).label("year"),
            extract("month", APSPGQuoteRecord.DatedIn).label("month"),
            func.count(APSPGQuoteProductQuotes.Id).label("count")
        )
        .join(APSPGQuoteProductQuotes, APSPGQuoteRecord.QuoteReference == APSPGQuoteProductQuotes.QuoteReference)
    )

    if product_type:
        monthly_counts = monthly_counts.filter(APSPGQuoteProductQuotes.ProductType == product_type)
    if user_id:
        monthly_counts = monthly_counts.filter(APSPGQuoteRecord.HandleById == user_id)
    elif current_user.Role == "Member":
        monthly_counts = monthly_counts.filter(APSPGQuoteRecord.HandleById == current_user.Id)

    monthly_counts = monthly_counts.group_by(
        extract("year", APSPGQuoteRecord.DatedIn),
        extract("month", APSPGQuoteRecord.DatedIn)
    ).order_by("year", "month").all()

    yearly_counts = (
        db.query(
            extract("year", APSPGQuoteRecord.DatedIn).label("year"),
            func.count(APSPGQuoteProductQuotes.Id).label("count")
        )
        .join(APSPGQuoteProductQuotes, APSPGQuoteRecord.QuoteReference == APSPGQuoteProductQuotes.QuoteReference)
    )

    if product_type:
        yearly_counts = yearly_counts.filter(APSPGQuoteProductQuotes.ProductType == product_type)
    if user_id:
        yearly_counts = yearly_counts.filter(APSPGQuoteRecord.HandleById == user_id)
    elif current_user.Role == "Member":
        yearly_counts = yearly_counts.filter(APSPGQuoteRecord.HandleById == current_user.Id)

    yearly_counts = yearly_counts.group_by(extract("year", APSPGQuoteRecord.DatedIn)).order_by("year").all()

    product_breakdown = (
        db.query(
            APSPGQuoteProductQuotes.ProductType,
            func.count(APSPGQuoteProductQuotes.Id).label("count")
        )
        .join(APSPGQuoteRecord, APSPGQuoteRecord.QuoteReference == APSPGQuoteProductQuotes.QuoteReference)
    )

    if user_id:
        product_breakdown = product_breakdown.filter(APSPGQuoteRecord.HandleById == user_id)
    elif current_user.Role == "Member":
        product_breakdown = product_breakdown.filter(APSPGQuoteRecord.HandleById == current_user.Id)

    product_breakdown = product_breakdown.group_by(APSPGQuoteProductQuotes.ProductType).all()

    user_stats = None
    if current_user.Role in ("Admin", "Manager"):
        user_stats = (
            db.query(
                APSPGQuoteUser.UserName,
                func.count(APSPGQuoteProductQuotes.Id).label("count")
            )
            .join(APSPGQuoteRecord, APSPGQuoteRecord.HandleById == APSPGQuoteUser.Id)
            .join(APSPGQuoteProductQuotes, APSPGQuoteRecord.QuoteReference == APSPGQuoteProductQuotes.QuoteReference)
            .group_by(APSPGQuoteUser.UserName)
            .all()
        )
        user_stats = [{"user_name": u.UserName, "count": u.count} for u in user_stats]

    return {
        "total_quotes": total_quotes,
        "monthly_counts": [
            {"year": int(m.year), "month": int(m.month), "count": m.count}
            for m in monthly_counts
        ],
        "yearly_counts": [
            {"year": int(y.year), "count": y.count}
            for y in yearly_counts
        ],
        "product_type_breakdown": [
            {"product_type": p.ProductType, "count": p.count}
            for p in product_breakdown
        ],
        "user_stats": user_stats,
    }


@router.get("/product-types")
def get_product_types_for_filter(db: Session = Depends(get_db)):
    types = (
        db.query(APSPGQuoteProductQuotes.ProductType)
        .distinct()
        .order_by(APSPGQuoteProductQuotes.ProductType)
        .all()
    )
    return [t.ProductType for t in types if t.ProductType]
