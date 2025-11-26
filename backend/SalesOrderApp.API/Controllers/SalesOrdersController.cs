using Microsoft.AspNetCore.Mvc;
using SalesOrderApp.Application.DTOs;
using SalesOrderApp.Application.Interfaces;

namespace SalesOrderApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesOrdersController : ControllerBase
{
    private readonly ISalesOrderService _salesOrderService;

    public SalesOrdersController(ISalesOrderService salesOrderService)
    {
        _salesOrderService = salesOrderService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalesOrderDto>>> GetAllSalesOrders()
    {
        var salesOrders = await _salesOrderService.GetAllSalesOrdersAsync();
        return Ok(salesOrders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SalesOrderDto>> GetSalesOrder(int id)
    {
        var salesOrder = await _salesOrderService.GetSalesOrderByIdAsync(id);
        if (salesOrder == null)
            return NotFound();

        return Ok(salesOrder);
    }

    [HttpPost]
    public async Task<ActionResult<SalesOrderDto>> CreateSalesOrder([FromBody] CreateSalesOrderDto createDto)
    {
        try
        {
            var salesOrder = await _salesOrderService.CreateSalesOrderAsync(createDto);
            return CreatedAtAction(nameof(GetSalesOrder), new { id = salesOrder.Id }, salesOrder);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SalesOrderDto>> UpdateSalesOrder(int id, [FromBody] CreateSalesOrderDto updateDto)
    {
        try
        {
            var salesOrder = await _salesOrderService.UpdateSalesOrderAsync(id, updateDto);
            return Ok(salesOrder);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSalesOrder(int id)
    {
        var result = await _salesOrderService.DeleteSalesOrderAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}

