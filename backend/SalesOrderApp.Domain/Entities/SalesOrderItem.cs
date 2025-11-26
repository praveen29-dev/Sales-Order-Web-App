namespace SalesOrderApp.Domain.Entities;

public class SalesOrderItem
{
    public int Id { get; set; }
    public int SalesOrderId { get; set; }
    public int ItemId { get; set; }
    public string Note { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal TaxRate { get; set; }
    public decimal ExclAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal InclAmount { get; set; }
    
    // Navigation properties
    public SalesOrder SalesOrder { get; set; } = null!;
    public Item Item { get; set; } = null!;
}

