namespace SalesOrderApp.Application.DTOs;

public class CreateSalesOrderItemDto
{
    public int ItemId { get; set; }
    public string Note { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal TaxRate { get; set; }
}

