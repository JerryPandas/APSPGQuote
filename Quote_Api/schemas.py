from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserInfo(BaseModel):
    Id: int
    UserName: str
    Email: Optional[str] = None
    Role: str
    Job: str
    IsActive: Optional[bool] = None

    class Config:
        from_attributes = True


class ProductQuoteOut(BaseModel):
    Id: int
    QuoteReference: str
    ItemSerialNumber: Optional[str] = None
    ProductType: str
    TypeDesign: str
    Rating: str
    RaisteamDesignCode: str
    EndConnection: str
    Size: str
    BodyMaterial: str
    EngineeringID: str
    AssemblyOption: str
    TrimType: Optional[str] = None
    FSNumber: str
    PSC: Optional[str] = None
    TotalPriceNetUnit: float
    OptionNetPriceExtraPerUnit: float
    QuoteTransferPerUnit: float
    TransferPriceExtra: float
    QuotePriceListPerUnit: float
    ListPriceExtra: float
    EngineeringHours: Optional[float] = None
    EngineeringCharges: float
    PatternCharges: float
    SpecFinalizedDate: datetime
    ReplyDate: datetime
    OriginalDueDate: datetime
    NoOfDateTakenFromDatedIn: int
    NoOfDateTakenFromSpecFinalizedDate: int
    OnTime: bool
    RightInFirstTime: Optional[str] = None
    RSDL: Optional[bool] = None
    NextDayResponse: bool
    ChildItem: int

    class Config:
        from_attributes = True


class ChildProductQuoteOut(BaseModel):
    Id: int
    QuoteReference: str
    ItemSerialNumber: Optional[str] = None
    ProductType: str
    TypeDesign: str
    Rating: str
    RaisteamDesignCode: str
    EndConnection: str
    Size: str
    BodyMaterial: str
    EngineeringID: str
    AssemblyOption: str
    TrimType: Optional[str] = None
    FSNumber: str
    PSC: Optional[str] = None
    TotalPriceNetUnit: float
    OptionNetPriceExtraPerUnit: float
    QuoteTransferPerUnit: float
    TransferPriceExtra: float
    QuotePriceListPerUnit: float
    ListPriceExtra: float
    EngineeringHours: Optional[float] = None
    EngineeringCharges: float
    PatternCharges: float
    SpecFinalizedDate: datetime
    ReplyDate: datetime
    OriginalDueDate: datetime
    NoOfDateTakenFromDatedIn: int
    NoOfDateTakenFromSpecFinalizedDate: int
    OnTime: bool
    RightInFirstTime: Optional[str] = None
    RSDL: Optional[bool] = None
    NextDayResponse: bool
    ChildItem: int

    class Config:
        from_attributes = True


class QuoteRecordOut(BaseModel):
    Id: int
    Category: str
    BuyerCustomer: str
    EndUser: str
    LBPName: str
    SourcingLocation: str
    DatedIn: datetime
    DueDate: datetime
    HandleById: int
    SalesName: int
    Remarks: Optional[str] = None
    SourcingRestriction: str
    KOB: int
    IndustryCode: int
    QuoteReference: str

    class Config:
        from_attributes = True


class SearchResultItem(BaseModel):
    record: QuoteRecordOut
    product: ProductQuoteOut
    children: List[ChildProductQuoteOut] = []
    sales_name: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    items: List[SearchResultItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class SearchRequest(BaseModel):
    fs_number: Optional[str] = None
    rating: Optional[str] = None
    size: Optional[str] = None
    body_material: Optional[str] = None
    end_connection: Optional[str] = None
    quote_reference: Optional[str] = None
    page: int = 1
    page_size: int = 20
    sort_field: Optional[str] = None
    sort_order: Optional[str] = "asc"


class DashboardStats(BaseModel):
    total_quotes: int
    monthly_counts: List[dict]
    yearly_counts: List[dict]
    product_type_breakdown: List[dict]
    user_stats: Optional[List[dict]] = None


class ChartDataPoint(BaseModel):
    label: str
    value: int


class LookupItem(BaseModel):
    id: int
    name: str


# ─── Create Schemas ───────────────────────────────────────────────

class RecordCreate(BaseModel):
    QuoteReference: str
    Category: str
    BuyerCustomer: str
    EndUser: str
    LBPName: str
    SourcingLocation: str = "Nilai"
    DatedIn: datetime
    DueDate: datetime
    HandleById: int
    SalesName: int
    Remarks: Optional[str] = None
    SourcingRestriction: str = "None"
    KOB: int
    IndustryCode: int


class ProductQuoteCreate(BaseModel):
    ItemSerialNumber: Optional[str] = None
    ProductType: str
    TypeDesign: str
    Rating: str
    RaisteamDesignCode: str
    EndConnection: str
    Size: str
    BodyMaterial: str
    EngineeringID: str
    AssemblyOption: str
    TrimType: Optional[str] = None
    FSNumber: str
    PSC: Optional[str] = None
    TotalPriceNetUnit: float = 0
    OptionNetPriceExtraPerUnit: float = 0
    QuoteTransferPerUnit: float = 0
    TransferPriceExtra: float = 0
    QuotePriceListPerUnit: float = 0
    ListPriceExtra: float = 0
    EngineeringHours: Optional[float] = None
    EngineeringCharges: float = 0
    PatternCharges: float = 0
    SpecFinalizedDate: datetime
    ReplyDate: datetime
    OriginalDueDate: datetime
    NoOfDateTakenFromDatedIn: int = 0
    NoOfDateTakenFromSpecFinalizedDate: int = 0
    OnTime: bool = True
    RightInFirstTime: Optional[str] = None
    RSDL: Optional[bool] = None
    NextDayResponse: bool = True


class ChildProductQuoteCreate(BaseModel):
    ItemSerialNumber: Optional[str] = None
    ProductType: str
    TypeDesign: str
    Rating: str
    RaisteamDesignCode: str
    EndConnection: str
    Size: str
    BodyMaterial: str
    EngineeringID: str
    AssemblyOption: str
    TrimType: Optional[str] = None
    FSNumber: str
    PSC: Optional[str] = None
    TotalPriceNetUnit: float = 0
    OptionNetPriceExtraPerUnit: float = 0
    QuoteTransferPerUnit: float = 0
    TransferPriceExtra: float = 0
    QuotePriceListPerUnit: float = 0
    ListPriceExtra: float = 0
    EngineeringHours: Optional[float] = None
    EngineeringCharges: float = 0
    PatternCharges: float = 0
    SpecFinalizedDate: datetime
    ReplyDate: datetime
    OriginalDueDate: datetime
    NoOfDateTakenFromDatedIn: int = 0
    NoOfDateTakenFromSpecFinalizedDate: int = 0
    OnTime: bool = True
    RightInFirstTime: Optional[str] = None
    RSDL: Optional[bool] = None
    NextDayResponse: bool = True


class RecordWithProducts(BaseModel):
    record: QuoteRecordOut
    products: List[ProductQuoteOut] = []
    children: List[ChildProductQuoteOut] = []
