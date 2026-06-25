-- Job=2
-- Bu,Rebecca
-- Chen,Justin
-- Chen,Sabrina
-- Choong,XinHui
-- Devadass,Kaliswaran
-- D, Sreekuttan
-- Ettiyappan, Pushpakaran
-- Ganesan,Teeban
-- Koh,Qianxi
-- Lam,Catherine
-- Li,Susan
-- Mohamed,Omar
-- Montenegro,Yaneth
-- Seng,Vincent
-- Shankar,Keerthana
-- Shi,May
-- Sun,Sophie
-- Thomas, Lionell
-- Velu,Nivedha
-- Xu,Richard
-- Zhou,Terry
CREATE TABLE [dbo].[APSPGQuoteUser] (
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [UserName] NVARCHAR (50) NULL,
    -- 登录名
    [Email] NVARCHAR (MAX) NULL,
    -- 登录密码明文存储
    [PassWordHash] NVARCHAR(256) NOT NULL,
    -- Admin | Manager | Member
    [Role] NVARCHAR (10) NOT NULL DEFAULT 'Member',
    -- 1/2/3
    [Job] NVARCHAR (100) NOT NULL,
    [IsActive] BIT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [RefreshToken] NVARCHAR(500) NULL,
    [RefreshTokenExpiry] DATETIME2 NULL,
    CONSTRAINT [PK_APSPGQuoteUser] PRIMARY KEY CLUSTERED ([Id] ASC)
);
-- 项目表
CREATE TABLE [dbo].[APSPGQuoteRecord](
    [Id] INT IDENTITY (1, 1) NOT NULL,
    -- Fasani/Rotary/Sliding Stem
    [Category] NVARCHAR(20) NOT NULL,
    [BuyerCustomer] NVARCHAR(200) NOT NULL,
    [EndUser] NVARCHAR(200) NOT NULL,
    [LBPName] NVARCHAR(200) NOT NULL,
    -- Nilai/WuQing/Sakura/EPMCL
    [SourcingLocation] NVARCHAR(26) NOT NULL DEFAULT 'Nilai',
    [DatedIn] DATETIME2 NOT NULL,
    [DueDate] DATETIME2 NOT NULL,
    -- Login user id
    [HandleById] INT NOT NULL,
    -- Job=2的所有人
    [SalesName] INT NOT NULL,
    [Remarks] NVARCHAR (MAX) NULL,
    [SourcingRestriction] NVARCHAR (MAX) NOT NULL DEFAULT 'None',
    -- 1/2/3
    [KOB] INT NOT NULL,
    [IndustryCode] INT NOT NULL,
    [QuoteReference] NVARCHAR(MAX) NOT NULL,
    CONSTRAINT [PK_APSPGQuoteRecord] PRIMARY KEY CLUSTERED ([Id] ASC)
);
-- Title
-- No China/India for body & bonnet
-- No China/India for BB & trim
-- No China for body & bonnet
-- No China for BB & trim
-- No India for body & bonnet
-- No India for BB & trim
CREATE TABLE [dbo].[APSPGQuoteSourcingRestriction](
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [Title] NVARCHAR (MAX) NULL,
    [Status] BIT NULL,
    CONSTRAINT [PK_APSPGQuoteSourcingRestriction] PRIMARY KEY CLUSTERED ([Id] ASC)
) -- Title
-- B1-OIL & GAS
-- B2-GAS PIPELINE DISTRIBUTION
-- B9-PETROCHEMICAL
-- C1-CHEMICAL
-- C2-REFINING
-- C4-MINING & METALS
-- C9-PETROCHEMICAL
-- D2-FOOD & BEVERAGES
-- D3-PAPER & PULP
-- D6-PHARMACEUTICALS
-- F1-POWER
-- L2-OTHERS
CREATE TABLE [dbo].[APSPGQuoteIndustryCode](
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [Title] NVARCHAR (MAX) NULL,
    [Status] BIT NULL,
    CONSTRAINT [PK_APSPGQuoteIndustryCode] PRIMARY KEY CLUSTERED ([Id] ASC)
) -- 一级表
CREATE TABLE [dbo].[APSPGQuoteProductQuotes] (
    [Id] INT IDENTITY(1, 1) NOT NULL,
    [QuoteReference] NVARCHAR(MAX) NOT NULL,
    -- 标识与产品基础信息
    [ItemSerialNumber] NVARCHAR(50) NULL,
    -- 条目序列号（设为主键）
    [ProductType] NVARCHAR(100) NOT NULL,
    -- 产品类型
    [TypeDesign] NVARCHAR(100) NOT NULL,
    -- 类型设计
    [Rating] NVARCHAR(50) NOT NULL,
    -- 额定值/等级
    [RaisteamDesignCode] NVARCHAR(100) NOT NULL,
    -- Raisteam 设计代码
    [EndConnection] NVARCHAR(100) NOT NULL,
    -- 端部连接
    [Size] NVARCHAR(50) NOT NULL,
    -- 尺寸
    [BodyMaterial] NVARCHAR(100) NOT NULL,
    -- 阀体/主体材料
    [EngineeringID] NVARCHAR(50) NOT NULL,
    -- 工程 ID
    -- Assembly/Option
    [AssemblyOption] NVARCHAR(100) NOT NULL,
    -- 装配/选项
    [TrimType] NVARCHAR(100) NULL,
    -- 内件类型
    [FSNumber] NVARCHAR(50) NOT NULL,
    -- FS 编号
    [PSC] NVARCHAR(50) NULL,
    -- PSC
    -- 价格与财务信息 (使用 DECIMAL 保证货币精度)
    [TotalPriceNetUnit] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 单台净总价
    [OptionNetPriceExtraPerUnit] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 单台选项额外净价
    [QuoteTransferPerUnit] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 单台报价转移费
    [TransferPriceExtra] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 额外转移价
    [QuotePriceListPerUnit] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 单台标准价格表报价
    [ListPriceExtra] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 额外表价
    -- 工程工时与费用
    [EngineeringHours] DECIMAL(10, 2),
    -- 工程工时
    [EngineeringCharges] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 工程费（0% 佣金净价）
    [PatternCharges] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 模具费（0% 佣金净价）
    -- 日期与时间节点
    [SpecFinalizedDate] DATETIME2 NOT NULL,
    -- 规格确定日期
    [ReplyDate] DATETIME2 NOT NULL,
    -- 回复日期
    [OriginalDueDate] DATETIME2 NOT NULL,
    -- 原始截止日期
    -- 需要计算Dated In与Reply Date之间间隔的工作日，且收到询价的当天不被计算在内
    [NoOfDateTakenFromDatedIn] INT NOT NULL,
    -- 自收单日起耗时天数
    -- 需要计算Spec Finalized Date与Reply Date之间间隔的工作日，且收到询价的当天不被计算在内
    [NoOfDateTakenFromSpecFinalizedDate] INT NOT NULL,
    -- 自规格确定日起耗时天数
    -- 当Reply Date<=Due Date时，则输出Yes,否则输出No
    [OnTime] BIT NOT NULL,
    -- 是否准时 (1=是, 0=否)
    [RightInFirstTime] NVARCHAR(50) NULL,
    -- 是否一次成功 (1=是, 0=否)
    [RSDL] BIT NULL,
    -- RSDL 编码/状态
    -- 当Reply Date<=Original Due Date时，则输出Yes,否则输出No
    [NextDayResponse] BIT NOT NULL,
    -- 是否次日回复 (1=是, 0=否)
    -- 当天日期年月日时分秒
    [ChildItem] INT NOT NULL,
    CONSTRAINT [PK_APSPGQuoteProductQuotes] PRIMARY KEY CLUSTERED ([Id] ASC)
);
-- 1. 创建产品类型主表
CREATE TABLE [dbo].[APSPG_ProductType] (
    [ProductTypeID] INT IDENTITY(1, 1) PRIMARY KEY,
    -- 自增主键
    [ProductTypeName] NVARCHAR(100) NOT NULL,
    -- 产品类型名称（必填且唯一）
);
-- 2. 创建类型设计明细表
CREATE TABLE [dbo].[APSPG_TypeDesign] (
    [TypeDesignID] INT IDENTITY(1, 1) PRIMARY KEY,
    -- 自增主键
    [ProductTypeID] INT NOT NULL,
    -- 外键，关联主表
    [TypeDesignName] NVARCHAR(100) NOT NULL,
    -- 类型设计名称（必填）
);
-- 二级表
CREATE TABLE [dbo].[APSPGQuoteChildProductQuotes] (
    [Id] INT IDENTITY(1, 1) NOT NULL,
    [QuoteReference] NVARCHAR(MAX) NOT NULL,
    -- 标识与产品基础信息
    [ItemSerialNumber] NVARCHAR(50) NULL,
    -- 条目序列号（设为主键）
    [ProductType] NVARCHAR(100) NOT NULL,
    -- 产品类型
    [TypeDesign] NVARCHAR(100) NOT NULL,
    -- 类型设计
    [Rating] NVARCHAR(50) NOT NULL,
    -- 额定值/等级
    [RaisteamDesignCode] NVARCHAR(100) NOT NULL,
    -- Raisteam 设计代码
    [EndConnection] NVARCHAR(100) NOT NULL,
    -- 端部连接
    [Size] NVARCHAR(50) NOT NULL,
    -- 尺寸
    [BodyMaterial] NVARCHAR(100) NOT NULL,
    -- 阀体/主体材料
    [EngineeringID] NVARCHAR(50) NOT NULL,
    -- 工程 ID
    -- Assembly/Option
    [AssemblyOption] NVARCHAR(100) NOT NULL,
    -- 装配/选项
    [TrimType] NVARCHAR(100) NULL,
    -- 内件类型
    [FSNumber] NVARCHAR(50) NOT NULL,
    -- FS 编号
    [PSC] NVARCHAR(50) NULL,
    -- PSC
    -- 价格与财务信息 (使用 DECIMAL 保证货币精度)
    [TotalPriceNetUnit] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 单台净总价
    [OptionNetPriceExtraPerUnit] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 单台选项额外净价
    [QuoteTransferPerUnit] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 单台报价转移费
    [TransferPriceExtra] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 额外转移价
    [QuotePriceListPerUnit] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 单台标准价格表报价
    [ListPriceExtra] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 额外表价
    -- 工程工时与费用
    [EngineeringHours] DECIMAL(10, 2),
    -- 工程工时
    [EngineeringCharges] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 工程费（0% 佣金净价）
    [PatternCharges] DECIMAL(18, 4) NOT NULL DEFAULT 0,
    -- 模具费（0% 佣金净价）
    -- 日期与时间节点
    [SpecFinalizedDate] DATETIME2 NOT NULL,
    -- 规格确定日期
    [ReplyDate] DATETIME2 NOT NULL,
    -- 回复日期
    [OriginalDueDate] DATETIME2 NOT NULL,
    -- 原始截止日期
    -- 需要计算Dated In与Reply Date之间间隔的工作日，且收到询价的当天不被计算在内
    [NoOfDateTakenFromDatedIn] INT NOT NULL,
    -- 自收单日起耗时天数
    -- 需要计算Spec Finalized Date与Reply Date之间间隔的工作日，且收到询价的当天不被计算在内
    [NoOfDateTakenFromSpecFinalizedDate] INT NOT NULL,
    -- 自规格确定日起耗时天数
    -- 当Reply Date<=Due Date时，则输出Yes,否则输出No
    [OnTime] BIT NOT NULL,
    -- 是否准时 (1=是, 0=否)
    [RightInFirstTime] NVARCHAR(50) NULL,
    -- 是否一次成功 (1=是, 0=否)
    [RSDL] BIT NULL,
    -- RSDL 编码/状态
    -- 当Reply Date<=Original Due Date时，则输出Yes,否则输出No
    [NextDayResponse] BIT NOT NULL,
    -- 是否次日回复 (1=是, 0=否)
    -- 存储APSPGQuoteProductQuotes中的ChildItem值
    [ChildItem] INT NOT NULL,
    CONSTRAINT [PK_APSPGQuoteChildProductQuotes] PRIMARY KEY CLUSTERED ([Id] ASC)
);
-- Rating
CREATE TABLE [dbo].[APSPG_Rating] (
    [Id] INT IDENTITY(1, 1) PRIMARY KEY,
    -- 外键，关联主表
    [Rating] NVARCHAR(100) NOT NULL,
    -- 类型设计名称（必填）
);
-- 1. 创建设计标准代码表
CREATE TABLE [dbo].[APSPG_RaisteamDesignCode] (
    [CodeID] INT IDENTITY(1, 1) PRIMARY KEY,
    -- 自增主键
    [DesignCode] NVARCHAR(150) NOT NULL,
);
-- 2. 创建通径/尺寸表
CREATE TABLE [dbo].[APSPG_PipeSize] (
    [SizeID] INT IDENTITY(1, 1) PRIMARY KEY,
    -- 自增主键
    [SizeValue] NVARCHAR(50) NOT NULL,
);
-- 3. 创建主体材质表
CREATE TABLE [dbo].[APSPG_BodyMaterial] (
    [MaterialID] INT IDENTITY(1, 1) PRIMARY KEY,
    -- 自增主键
    [MaterialName] NVARCHAR(100) NOT NULL,
);