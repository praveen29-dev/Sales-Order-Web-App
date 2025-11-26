using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SalesOrderApp.Application.DTOs;
using SalesOrderApp.Application.Interfaces;
using SalesOrderApp.Domain.Entities;
using SalesOrderApp.Infrastructure.Data;
using SalesOrderApp.Infrastructure.Repositories;

namespace SalesOrderApp.Application.Services;

public class ItemService : IItemService
{
    private readonly IRepository<Item> _repository;
    private readonly IMapper _mapper;
    private readonly ApplicationDbContext _context;

    public ItemService(IRepository<Item> repository, IMapper mapper, ApplicationDbContext context)
    {
        _repository = repository;
        _mapper = mapper;
        _context = context;
    }

    public async Task<IEnumerable<ItemDto>> GetAllItemsAsync()
    {
        var items = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<ItemDto>>(items);
    }

    public async Task<ItemDto?> GetItemByIdAsync(int id)
    {
        var item = await _repository.GetByIdAsync(id);
        return item == null ? null : _mapper.Map<ItemDto>(item);
    }

    public async Task<ItemDto?> GetItemByCodeAsync(string code)
    {
        var items = await _repository.FindAsync(i => i.Code == code);
        var item = items.FirstOrDefault();
        return item == null ? null : _mapper.Map<ItemDto>(item);
    }
}

