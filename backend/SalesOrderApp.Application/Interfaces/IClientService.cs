using SalesOrderApp.Application.DTOs;

namespace SalesOrderApp.Application.Interfaces;

public interface IClientService
{
    Task<IEnumerable<ClientDto>> GetAllClientsAsync();
    Task<ClientDto?> GetClientByIdAsync(int id);
}

