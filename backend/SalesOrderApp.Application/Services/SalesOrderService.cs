using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SalesOrderApp.Application.DTOs;
using SalesOrderApp.Application.Interfaces;
using SalesOrderApp.Domain.Entities;
using SalesOrderApp.Infrastructure.Data;
using SalesOrderApp.Infrastructure.Repositories;

namespace SalesOrderApp.Application.Services;

public class SalesOrderService : ISalesOrderService
{
    private readonly IRepository<SalesOrder> _repository;
    private readonly IRepository<Client> _clientRepository;
    private readonly IRepository<Item> _itemRepository;
    private readonly IMapper _mapper;
    private readonly ApplicationDbContext _context;

    public SalesOrderService(
        IRepository<SalesOrder> repository,
        IRepository<Client> clientRepository,
        IRepository<Item> itemRepository,
        IMapper mapper,
        ApplicationDbContext context)
    {
        _repository = repository;
        _clientRepository = clientRepository;
        _itemRepository = itemRepository;
        _mapper = mapper;
        _context = context;
    }

    public async Task<IEnumerable<SalesOrderDto>> GetAllSalesOrdersAsync()
    {
        var salesOrders = await _context.SalesOrders
            .Include(so => so.Client)
            .Include(so => so.SalesOrderItems)
                .ThenInclude(soi => soi.Item)
            .OrderByDescending(so => so.OrderDate)
            .ToListAsync();

        return _mapper.Map<IEnumerable<SalesOrderDto>>(salesOrders);
    }

    public async Task<SalesOrderDto?> GetSalesOrderByIdAsync(int id)
    {
        var salesOrder = await _context.SalesOrders
            .Include(so => so.Client)
            .Include(so => so.SalesOrderItems)
                .ThenInclude(soi => soi.Item)
            .FirstOrDefaultAsync(so => so.Id == id);

        return salesOrder == null ? null : _mapper.Map<SalesOrderDto>(salesOrder);
    }

    public async Task<SalesOrderDto> CreateSalesOrderAsync(CreateSalesOrderDto createDto)
    {
        var client = await _clientRepository.GetByIdAsync(createDto.ClientId);
        if (client == null)
            throw new ArgumentException("Client not found");

        var salesOrder = new SalesOrder
        {
            ClientId = createDto.ClientId,
            OrderNumber = GenerateOrderNumber(),
            OrderDate = DateTime.UtcNow,
            InvoiceNumber = createDto.InvoiceNumber,
            InvoiceDate = createDto.InvoiceDate,
            ReferenceNumber = createDto.ReferenceNumber,
            Notes = createDto.Notes,
            Address1 = createDto.Address1,
            Address2 = createDto.Address2,
            Address3 = createDto.Address3,
            State = createDto.State,
            PostCode = createDto.PostCode,
            CreatedDate = DateTime.UtcNow
        };

        decimal totalExcl = 0, totalTax = 0, totalIncl = 0;

        foreach (var itemDto in createDto.Items)
        {
            var item = await _itemRepository.GetByIdAsync(itemDto.ItemId);
            if (item == null)
                throw new ArgumentException($"Item with ID {itemDto.ItemId} not found");

            var exclAmount = itemDto.Quantity * item.Price;
            var taxAmount = exclAmount * itemDto.TaxRate / 100;
            var inclAmount = exclAmount + taxAmount;

            totalExcl += exclAmount;
            totalTax += taxAmount;
            totalIncl += inclAmount;

            salesOrder.SalesOrderItems.Add(new SalesOrderItem
            {
                ItemId = itemDto.ItemId,
                Note = itemDto.Note,
                Quantity = itemDto.Quantity,
                TaxRate = itemDto.TaxRate,
                ExclAmount = exclAmount,
                TaxAmount = taxAmount,
                InclAmount = inclAmount
            });
        }

        salesOrder.TotalExclAmount = totalExcl;
        salesOrder.TotalTaxAmount = totalTax;
        salesOrder.TotalInclAmount = totalIncl;

        await _repository.AddAsync(salesOrder);

        return await GetSalesOrderByIdAsync(salesOrder.Id) ?? throw new Exception("Failed to retrieve created sales order");
    }

    public async Task<SalesOrderDto> UpdateSalesOrderAsync(int id, CreateSalesOrderDto updateDto)
    {
        var salesOrder = await _context.SalesOrders
            .Include(so => so.SalesOrderItems)
            .FirstOrDefaultAsync(so => so.Id == id);

        if (salesOrder == null)
            throw new ArgumentException("Sales order not found");

        var client = await _clientRepository.GetByIdAsync(updateDto.ClientId);
        if (client == null)
            throw new ArgumentException("Client not found");

        // Update basic info
        salesOrder.ClientId = updateDto.ClientId;
        salesOrder.InvoiceNumber = updateDto.InvoiceNumber;
        salesOrder.InvoiceDate = updateDto.InvoiceDate;
        salesOrder.ReferenceNumber = updateDto.ReferenceNumber;
        salesOrder.Notes = updateDto.Notes;
        salesOrder.Address1 = updateDto.Address1;
        salesOrder.Address2 = updateDto.Address2;
        salesOrder.Address3 = updateDto.Address3;
        salesOrder.State = updateDto.State;
        salesOrder.PostCode = updateDto.PostCode;
        salesOrder.ModifiedDate = DateTime.UtcNow;

        // Remove existing items
        _context.SalesOrderItems.RemoveRange(salesOrder.SalesOrderItems);
        salesOrder.SalesOrderItems.Clear();

        // Add new items
        decimal totalExcl = 0, totalTax = 0, totalIncl = 0;

        foreach (var itemDto in updateDto.Items)
        {
            var item = await _itemRepository.GetByIdAsync(itemDto.ItemId);
            if (item == null)
                throw new ArgumentException($"Item with ID {itemDto.ItemId} not found");

            var exclAmount = itemDto.Quantity * item.Price;
            var taxAmount = exclAmount * itemDto.TaxRate / 100;
            var inclAmount = exclAmount + taxAmount;

            totalExcl += exclAmount;
            totalTax += taxAmount;
            totalIncl += inclAmount;

            salesOrder.SalesOrderItems.Add(new SalesOrderItem
            {
                ItemId = itemDto.ItemId,
                Note = itemDto.Note,
                Quantity = itemDto.Quantity,
                TaxRate = itemDto.TaxRate,
                ExclAmount = exclAmount,
                TaxAmount = taxAmount,
                InclAmount = inclAmount
            });
        }

        salesOrder.TotalExclAmount = totalExcl;
        salesOrder.TotalTaxAmount = totalTax;
        salesOrder.TotalInclAmount = totalIncl;

        await _repository.UpdateAsync(salesOrder);

        return await GetSalesOrderByIdAsync(salesOrder.Id) ?? throw new Exception("Failed to retrieve updated sales order");
    }

    public async Task<bool> DeleteSalesOrderAsync(int id)
    {
        var salesOrder = await _repository.GetByIdAsync(id);
        if (salesOrder == null)
            return false;

        await _repository.DeleteAsync(salesOrder);
        return true;
    }

    private string GenerateOrderNumber()
    {
        return $"SO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper()}";
    }
}

