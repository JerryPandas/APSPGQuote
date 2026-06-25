from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings
import pyodbc


def get_odbc_driver() -> str:
    """Detect available SQL Server ODBC driver on Windows."""
    drivers = [d for d in pyodbc.drivers() if 'SQL Server' in d]
    # Preferred order
    for preferred in [
        'ODBC Driver 18 for SQL Server',
        'ODBC Driver 17 for SQL Server',
        'ODBC Driver 13 for SQL Server',
        'SQL Server Native Client 11.0',
        'SQL Server',
    ]:
        if preferred in drivers:
            return preferred
    # Fallback to first available
    return drivers[0] if drivers else 'ODBC Driver 17 for SQL Server'


def build_connection_url() -> str:
    import urllib.parse
    driver = get_odbc_driver()
    conn_str = (
        f"DRIVER={{{driver}}};"
        "Server=localhost;"
        "Database=APSPGQuote;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
        "Encrypt=yes"
    )
    return f"mssql+pyodbc:///?odbc_connect={urllib.parse.quote_plus(conn_str)}"


DATABASE_URL = build_connection_url()
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
