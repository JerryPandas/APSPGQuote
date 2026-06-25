import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import (
    APSPGQuoteRecord, APSPGQuoteProductQuotes,
    APSPGQuoteChildProductQuotes, APSPGQuoteUser
)
from auth import get_current_user, require_role

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.get("/csv")
def export_csv(db: Session = Depends(get_db), current_user: APSPGQuoteUser = Depends(get_current_user)):
    records_query = db.query(APSPGQuoteRecord)
    if current_user.Role == "Member":
        records_query = records_query.filter(APSPGQuoteRecord.HandleById == current_user.Id)

    records = records_query.all()

    output = io.StringIO()
    writer = csv.writer(output)

    headers = [
        "Category", "QuoteReference", "BuyerCustomer", "EndUser", "LBPName",
        "SourcingLocation", "DatedIn", "DueDate", "HandleById", "SalesName",
        "Remarks", "SourcingRestriction", "KOB", "IndustryCode",
        "Product_Type", "TypeDesign", "Rating", "RaisteamDesignCode",
        "EndConnection", "Size", "BodyMaterial", "EngineeringID",
        "AssemblyOption", "TrimType", "FSNumber", "PSC",
        "TotalPriceNetUnit", "OptionNetPriceExtraPerUnit", "QuoteTransferPerUnit",
        "TransferPriceExtra", "QuotePriceListPerUnit", "ListPriceExtra",
        "EngineeringHours", "EngineeringCharges", "PatternCharges",
        "SpecFinalizedDate", "ReplyDate", "OriginalDueDate",
        "NoOfDateTakenFromDatedIn", "NoOfDateTakenFromSpecFinalizedDate",
        "OnTime", "RightInFirstTime", "RSDL", "NextDayResponse",
        "Child_FSNumber", "Child_TotalPriceNetUnit", "Child_OptionNetPriceExtraPerUnit",
        "Child_QuoteTransferPerUnit", "Child_TransferPriceExtra",
        "Child_QuotePriceListPerUnit", "Child_ListPriceExtra",
        "Child_EngineeringHours", "Child_EngineeringCharges"
    ]
    writer.writerow(headers)

    for record in records:
        products = db.query(APSPGQuoteProductQuotes).filter(
            APSPGQuoteProductQuotes.QuoteReference == record.QuoteReference
        ).all()

        for p in products:
            children = db.query(APSPGQuoteChildProductQuotes).filter(
                APSPGQuoteChildProductQuotes.ChildItem == p.ChildItem
            ).all()

            if children:
                for c in children:
                    writer.writerow([
                        record.Category, record.QuoteReference, record.BuyerCustomer,
                        record.EndUser, record.LBPName, record.SourcingLocation,
                        record.DatedIn, record.DueDate, record.HandleById,
                        record.SalesName, record.Remarks, record.SourcingRestriction,
                        record.KOB, record.IndustryCode,
                        p.ProductType, p.TypeDesign, p.Rating, p.RaisteamDesignCode,
                        p.EndConnection, p.Size, p.BodyMaterial, p.EngineeringID,
                        p.AssemblyOption, p.TrimType, p.FSNumber, p.PSC,
                        p.TotalPriceNetUnit, p.OptionNetPriceExtraPerUnit,
                        p.QuoteTransferPerUnit, p.TransferPriceExtra,
                        p.QuotePriceListPerUnit, p.ListPriceExtra,
                        p.EngineeringHours, p.EngineeringCharges, p.PatternCharges,
                        p.SpecFinalizedDate, p.ReplyDate, p.OriginalDueDate,
                        p.NoOfDateTakenFromDatedIn, p.NoOfDateTakenFromSpecFinalizedDate,
                        p.OnTime, p.RightInFirstTime, p.RSDL, p.NextDayResponse,
                        c.FSNumber, c.TotalPriceNetUnit, c.OptionNetPriceExtraPerUnit,
                        c.QuoteTransferPerUnit, c.TransferPriceExtra,
                        c.QuotePriceListPerUnit, c.ListPriceExtra,
                        c.EngineeringHours, c.EngineeringCharges
                    ])
            else:
                writer.writerow([
                    record.Category, record.QuoteReference, record.BuyerCustomer,
                    record.EndUser, record.LBPName, record.SourcingLocation,
                    record.DatedIn, record.DueDate, record.HandleById,
                    record.SalesName, record.Remarks, record.SourcingRestriction,
                    record.KOB, record.IndustryCode,
                    p.ProductType, p.TypeDesign, p.Rating, p.RaisteamDesignCode,
                    p.EndConnection, p.Size, p.BodyMaterial, p.EngineeringID,
                    p.AssemblyOption, p.TrimType, p.FSNumber, p.PSC,
                    p.TotalPriceNetUnit, p.OptionNetPriceExtraPerUnit,
                    p.QuoteTransferPerUnit, p.TransferPriceExtra,
                    p.QuotePriceListPerUnit, p.ListPriceExtra,
                    p.EngineeringHours, p.EngineeringCharges, p.PatternCharges,
                    p.SpecFinalizedDate, p.ReplyDate, p.OriginalDueDate,
                    p.NoOfDateTakenFromDatedIn, p.NoOfDateTakenFromSpecFinalizedDate,
                    p.OnTime, p.RightInFirstTime, p.RSDL, p.NextDayResponse,
                    "", "", "", "", "", "", "", "", ""
                ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=quotes_export_{current_user.UserName}.csv"}
    )
