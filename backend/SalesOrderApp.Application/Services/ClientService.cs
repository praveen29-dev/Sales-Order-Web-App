using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SalesOrderApp.Application.DTOs;
using SalesOrderApp.Application.Interfaces;
using SalesOrderApp.Domain.Entities;
using SalesOrderApp.Infrastructure.Data;
using SalesOrderApp.Infrastructure.Repositories;

namespace SalesOrderApp.Application.Services;

public class ClientService : IClientService
{
    private readonly IRepository<Client> _repository;
    private readonly IMapper _mapper;
    private readonly ApplicationDbContext _context;

    public ClientService(IRepository<Client> repository, IMapper mapper, ApplicationDbContext context)
    {
        _repository = repository;
        _mapper = mapper;
        _context = context;
    }

    public async Task<IEnumerable<ClientDto>> GetAllClientsAsync()
    {
        var clients = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<ClientDto>>(clients);
    }

    public async Task<ClientDto?> GetClientByIdAsync(int id)
    {
        var client = await _repository.GetByIdAsync(id);
        return client == null ? null : _mapper.Map<ClientDto>(client);
    }
}

