using SalesOrderApp.Application.DTOs;

namespace SalesOrderApp.Application.Interfaces;

public interface ISalesOrderService
{
    Task<IEnumerable<SalesOrderDto>> GetAllSalesOrdersAsync();
    Task<SalesOrderDto?> GetSalesOrderByIdAsync(int id);
    Task<SalesOrderDto> CreateSalesOrderAsync(CreateSalesOrderDto createDto);
    Task<SalesOrderDto> UpdateSalesOrderAsync(int id, CreateSalesOrderDto updateDto);
    Task<bool> DeleteSalesOrderAsync(int id);
}

