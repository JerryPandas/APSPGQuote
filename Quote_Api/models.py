from sqlalchemy import Column, Integer, String, NVARCHAR, DateTime, Float, BigInteger, Boolean, Date, Text, DECIMAL, ForeignKey, and_
from sqlalchemy.orm import relationship
from database import Base


class APSPGQuoteUser(Base):
    __tablename__ = "APSPGQuoteUser"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    UserName = Column(NVARCHAR(50))
    Email = Column(NVARCHAR)
    PassWordHash = Column(NVARCHAR(256), nullable=False)
    Role = Column(NVARCHAR(10), nullable=False, default="Member")
    Job = Column(NVARCHAR(100), nullable=False)
    IsActive = Column(Boolean)
    CreatedAt = Column(DateTime, nullable=False)
    RefreshToken = Column(NVARCHAR(500))
    RefreshTokenExpiry = Column(DateTime)


class APSPGQuoteRecord(Base):
    __tablename__ = "APSPGQuoteRecord"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Category = Column(NVARCHAR(20), nullable=False)
    BuyerCustomer = Column(NVARCHAR(200), nullable=False)
    EndUser = Column(NVARCHAR(200), nullable=False)
    LBPName = Column(NVARCHAR(200), nullable=False)
    SourcingLocation = Column(NVARCHAR(26), nullable=False, default="Nilai")
    DatedIn = Column(DateTime, nullable=False)
    DueDate = Column(DateTime, nullable=False)
    HandleById = Column(Integer, nullable=False)
    SalesName = Column(Integer, nullable=False)
    Remarks = Column(NVARCHAR)
    SourcingRestriction = Column(NVARCHAR, nullable=False, default="None")
    KOB = Column(Integer, nullable=False)
    IndustryCode = Column(Integer, nullable=False)
    QuoteReference = Column(NVARCHAR, nullable=False, unique=True)

    products = relationship("APSPGQuoteProductQuotes", back_populates="record",
                            foreign_keys="[APSPGQuoteProductQuotes.QuoteReference]",
                            primaryjoin="APSPGQuoteRecord.QuoteReference == APSPGQuoteProductQuotes.QuoteReference")


class APSPGQuoteProductQuotes(Base):
    __tablename__ = "APSPGQuoteProductQuotes"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    QuoteReference = Column(NVARCHAR, nullable=False, unique=True)
    ItemSerialNumber = Column(NVARCHAR(50))
    ProductType = Column(NVARCHAR(100), nullable=False)
    TypeDesign = Column(NVARCHAR(100), nullable=False)
    Rating = Column(NVARCHAR(50), nullable=False)
    RaisteamDesignCode = Column(NVARCHAR(100), nullable=False)
    EndConnection = Column(NVARCHAR(100), nullable=False)
    Size = Column(NVARCHAR(50), nullable=False)
    BodyMaterial = Column(NVARCHAR(100), nullable=False)
    EngineeringID = Column(NVARCHAR(50), nullable=False)
    AssemblyOption = Column(NVARCHAR(100), nullable=False)
    TrimType = Column(NVARCHAR(100))
    FSNumber = Column(NVARCHAR(50), nullable=False)
    PSC = Column(NVARCHAR(50))
    TotalPriceNetUnit = Column(DECIMAL(18, 4), nullable=False, default=0)
    OptionNetPriceExtraPerUnit = Column(DECIMAL(18, 4), nullable=False, default=0)
    QuoteTransferPerUnit = Column(DECIMAL(18, 4), nullable=False, default=0)
    TransferPriceExtra = Column(DECIMAL(18, 4), nullable=False, default=0)
    QuotePriceListPerUnit = Column(DECIMAL(18, 4), nullable=False, default=0)
    ListPriceExtra = Column(DECIMAL(18, 4), nullable=False, default=0)
    EngineeringHours = Column(DECIMAL(10, 2))
    EngineeringCharges = Column(DECIMAL(18, 4), nullable=False, default=0)
    PatternCharges = Column(DECIMAL(18, 4), nullable=False, default=0)
    SpecFinalizedDate = Column(DateTime, nullable=False)
    ReplyDate = Column(DateTime, nullable=False)
    OriginalDueDate = Column(DateTime, nullable=False)
    NoOfDateTakenFromDatedIn = Column(Integer, nullable=False)
    NoOfDateTakenFromSpecFinalizedDate = Column(Integer, nullable=False)
    OnTime = Column(Boolean, nullable=False)
    RightInFirstTime = Column(NVARCHAR(50))
    RSDL = Column(Boolean)
    NextDayResponse = Column(Boolean, nullable=False)
    ChildItem = Column(Integer, nullable=False)
    APSPGQuoteRecordIsId = Column(Integer, nullable=False)

    record = relationship("APSPGQuoteRecord", back_populates="products",
                          foreign_keys=[QuoteReference, APSPGQuoteRecordIsId],
                          primaryjoin="and_(APSPGQuoteProductQuotes.QuoteReference == APSPGQuoteRecord.QuoteReference, APSPGQuoteProductQuotes.APSPGQuoteRecordIsId == APSPGQuoteRecord.Id)")
    children = relationship("APSPGQuoteChildProductQuotes", back_populates="parent",
                            foreign_keys="[APSPGQuoteChildProductQuotes.ChildItem]",
                            primaryjoin="APSPGQuoteProductQuotes.ChildItem == APSPGQuoteChildProductQuotes.ChildItem")


class APSPGQuoteChildProductQuotes(Base):
    __tablename__ = "APSPGQuoteChildProductQuotes"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    QuoteReference = Column(NVARCHAR, nullable=False, unique=True)
    ItemSerialNumber = Column(NVARCHAR(50))
    ProductType = Column(NVARCHAR(100), nullable=False)
    TypeDesign = Column(NVARCHAR(100), nullable=False)
    Rating = Column(NVARCHAR(50), nullable=False)
    RaisteamDesignCode = Column(NVARCHAR(100), nullable=False)
    EndConnection = Column(NVARCHAR(100), nullable=False)
    Size = Column(NVARCHAR(50), nullable=False)
    BodyMaterial = Column(NVARCHAR(100), nullable=False)
    EngineeringID = Column(NVARCHAR(50), nullable=False)
    AssemblyOption = Column(NVARCHAR(100), nullable=False)
    TrimType = Column(NVARCHAR(100))
    FSNumber = Column(NVARCHAR(50), nullable=False)
    PSC = Column(NVARCHAR(50))
    TotalPriceNetUnit = Column(DECIMAL(18, 4), nullable=False, default=0)
    OptionNetPriceExtraPerUnit = Column(DECIMAL(18, 4), nullable=False, default=0)
    QuoteTransferPerUnit = Column(DECIMAL(18, 4), nullable=False, default=0)
    TransferPriceExtra = Column(DECIMAL(18, 4), nullable=False, default=0)
    QuotePriceListPerUnit = Column(DECIMAL(18, 4), nullable=False, default=0)
    ListPriceExtra = Column(DECIMAL(18, 4), nullable=False, default=0)
    EngineeringHours = Column(DECIMAL(10, 2))
    EngineeringCharges = Column(DECIMAL(18, 4), nullable=False, default=0)
    PatternCharges = Column(DECIMAL(18, 4), nullable=False, default=0)
    SpecFinalizedDate = Column(DateTime, nullable=False)
    ReplyDate = Column(DateTime, nullable=False)
    OriginalDueDate = Column(DateTime, nullable=False)
    NoOfDateTakenFromDatedIn = Column(Integer, nullable=False)
    NoOfDateTakenFromSpecFinalizedDate = Column(Integer, nullable=False)
    OnTime = Column(Boolean, nullable=False)
    RightInFirstTime = Column(NVARCHAR(50))
    RSDL = Column(Boolean)
    NextDayResponse = Column(Boolean, nullable=False)
    ChildItem = Column(Integer, nullable=False)

    parent = relationship("APSPGQuoteProductQuotes", back_populates="children",
                          foreign_keys=[ChildItem],
                          primaryjoin="APSPGQuoteProductQuotes.ChildItem == APSPGQuoteChildProductQuotes.ChildItem")


class APSPGQuoteSourcingRestriction(Base):
    __tablename__ = "APSPGQuoteSourcingRestriction"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Title = Column(NVARCHAR)
    Status = Column(Boolean)


class APSPGQuoteIndustryCode(Base):
    __tablename__ = "APSPGQuoteIndustryCode"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Title = Column(NVARCHAR)
    Status = Column(Boolean)


class APSPGProductType(Base):
    __tablename__ = "APSPG_ProductType"
    ProductTypeID = Column(Integer, primary_key=True, autoincrement=True)
    ProductTypeName = Column(NVARCHAR(100), nullable=False)


class APSPGTypeDesign(Base):
    __tablename__ = "APSPG_TypeDesign"
    TypeDesignID = Column(Integer, primary_key=True, autoincrement=True)
    ProductTypeID = Column(Integer, nullable=False)
    TypeDesignName = Column(NVARCHAR(100), nullable=False)


class APSPGRating(Base):
    __tablename__ = "APSPG_Rating"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Rating = Column(NVARCHAR(100), nullable=False)


class APSPGRaisteamDesignCode(Base):
    __tablename__ = "APSPG_RaisteamDesignCode"
    CodeID = Column(Integer, primary_key=True, autoincrement=True)
    DesignCode = Column(NVARCHAR(150), nullable=False)


class APSPGPipeSize(Base):
    __tablename__ = "APSPG_PipeSize"
    SizeID = Column(Integer, primary_key=True, autoincrement=True)
    SizeValue = Column(NVARCHAR(50), nullable=False)


class APSPGBodyMaterial(Base):
    __tablename__ = "APSPG_BodyMaterial"
    MaterialID = Column(Integer, primary_key=True, autoincrement=True)
    MaterialName = Column(NVARCHAR(100), nullable=False)
