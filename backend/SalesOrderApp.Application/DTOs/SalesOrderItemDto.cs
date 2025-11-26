namespace SalesOrderApp.Application.DTOs;

public class SalesOrderItemDto
{
    public int Id { get; set; }
    public int ItemId { get; set; }
    public string ItemCode { get; set; } = string.Empty;
    public string ItemDescription { get; set; } = string.Empty;
    public decimal ItemPrice { get; set; }
    public string Note { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal TaxRate { get; set; }
    public decimal ExclAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal InclAmount { get; set; }
}

