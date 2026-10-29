use chrono::NaiveDate;
use serde::Deserialize;
use serde_json::Value;

#[derive(Debug, Deserialize)]
pub struct ReportQuery {
    #[serde(default)]
    pub search: Option<String>,
    #[serde(default)]
    pub period: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ReportLockQuery {
    pub period: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateReportLockDto {
    pub period: String,
    #[serde(default)]
    pub as_of_date: Option<NaiveDate>,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub locked_by: Option<i64>,
}

#[derive(Debug, Clone, Copy)]
pub enum ReportKind {
    OutstandingReceivable,
    OutstandingPayable,
    AgingSchedule,
    StockCard,
    GeneralLedger,
    TrialBalance,
    ProfitLoss,
    BalanceSheet,
    CashFlow,
    BudgetVsActual,
    CustomerOmzet,
    PurchaseByVendor,
    OrderFulfillment,
    TaxSummary,
    GrossProfit,
    Omzet,
    QuotationDetail,
    QuotationVsPo,
    Outstanding,
    TransactionTracking,
    InventoryValuation,
}

impl ReportKind {
    pub fn from_slug(slug: &str) -> Option<Self> {
        match slug {
            "outstanding-receivable" => Some(Self::OutstandingReceivable),
            "outstanding-payable" => Some(Self::OutstandingPayable),
            "aging-schedule" => Some(Self::AgingSchedule),
            "stock-card" => Some(Self::StockCard),
            "general-ledger" => Some(Self::GeneralLedger),
            "trial-balance" => Some(Self::TrialBalance),
            "profit-loss" => Some(Self::ProfitLoss),
            "balance-sheet" => Some(Self::BalanceSheet),
            "cash-flow" => Some(Self::CashFlow),
            "budget-vs-actual" => Some(Self::BudgetVsActual),
            "customer-omzet" => Some(Self::CustomerOmzet),
            "purchase-by-vendor" => Some(Self::PurchaseByVendor),
            "order-fulfillment" => Some(Self::OrderFulfillment),
            "tax-summary" => Some(Self::TaxSummary),
            "gross-profit" => Some(Self::GrossProfit),
            "omzet" => Some(Self::Omzet),
            "quotation-detail" => Some(Self::QuotationDetail),
            "quotation-vs-po" => Some(Self::QuotationVsPo),
            "outstanding" => Some(Self::Outstanding),
            "transaction-tracking" => Some(Self::TransactionTracking),
            "inventory-valuation" => Some(Self::InventoryValuation),
            _ => None,
        }
    }

    pub fn view(self) -> &'static str {
        match self {
            Self::OutstandingReceivable => "report_outstanding_receivable",
            Self::OutstandingPayable => "report_outstanding_payable",
            Self::AgingSchedule => "report_aging_schedule",
            Self::StockCard => "report_stock_card",
            Self::GeneralLedger => "report_general_ledger",
            Self::TrialBalance => "report_trial_balance",
            Self::ProfitLoss => "report_profit_loss",
            Self::BalanceSheet => "report_balance_sheet",
            Self::CashFlow => "report_cash_flow",
            Self::BudgetVsActual => "report_budget_vs_actual",
            Self::CustomerOmzet => "report_customer_omzet",
            Self::PurchaseByVendor => "report_purchase_by_vendor",
            Self::OrderFulfillment => "report_order_fulfillment",
            Self::TaxSummary => "report_tax_summary",
            Self::GrossProfit => "report_gross_profit",
            Self::Omzet => "report_omzet",
            Self::QuotationDetail => "report_quotation_detail",
            Self::QuotationVsPo => "report_quotation_vs_po",
            Self::Outstanding => "report_outstanding",
            Self::TransactionTracking => "report_transaction_tracking",
            Self::InventoryValuation => "report_inventory_valuation",
        }
    }

    pub fn is_financial(self) -> bool {
        matches!(
            self,
            Self::GeneralLedger
                | Self::TrialBalance
                | Self::ProfitLoss
                | Self::BalanceSheet
                | Self::CashFlow
        )
    }

    pub fn all() -> &'static [&'static str] {
        &[
            "outstanding-receivable",
            "outstanding-payable",
            "aging-schedule",
            "stock-card",
            "general-ledger",
            "trial-balance",
            "profit-loss",
            "balance-sheet",
            "cash-flow",
            "budget-vs-actual",
            "customer-omzet",
            "purchase-by-vendor",
            "order-fulfillment",
            "tax-summary",
            "gross-profit",
            "omzet",
            "quotation-detail",
            "quotation-vs-po",
            "outstanding",
            "transaction-tracking",
            "inventory-valuation",
        ]
    }
}

#[derive(Debug, serde::Serialize)]
pub struct ReportResponse {
    pub report: String,
    pub rows: Value,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_every_report_slug_to_a_view() {
        for slug in ReportKind::all() {
            let kind = ReportKind::from_slug(slug).expect("slug must map to a report");
            assert!(kind.view().starts_with("report_"));
        }
    }

    #[test]
    fn rejects_unknown_report_slug() {
        assert!(ReportKind::from_slug("does-not-exist").is_none());
    }
}
