using Microsoft.EntityFrameworkCore;
using SalesOrderApp.Application.Interfaces;
using SalesOrderApp.Application.Mapping;
using SalesOrderApp.Application.Services;
using SalesOrderApp.Infrastructure.Data;
using SalesOrderApp.Infrastructure.Repositories;
using SalesOrderApp.Domain.Entities;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
// Using SQLite for easier setup (no SQL Server installation required)
// To use SQL Server, uncomment the SQL Server code and comment out SQLite code
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=SalesOrderApp.db";

// SQLite configuration (default - no installation needed)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

// SQL Server configuration (uncomment if you have SQL Server installed)
// var sqlServerConnectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
//     ?? "Server=(localdb)\\mssqllocaldb;Database=SalesOrderAppDb;Trusted_Connection=True;MultipleActiveResultSets=true";
// builder.Services.AddDbContext<ApplicationDbContext>(options =>
//     options.UseSqlServer(sqlServerConnectionString));

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// Repositories
builder.Services.AddScoped<IRepository<Client>, Repository<Client>>();
builder.Services.AddScoped<IRepository<Item>, Repository<Item>>();
builder.Services.AddScoped<IRepository<SalesOrder>, Repository<SalesOrder>>();
builder.Services.AddScoped<IRepository<SalesOrderItem>, Repository<SalesOrderItem>>();

// Services
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<ISalesOrderService, SalesOrderService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
        
        // Seed initial data if database is empty
        if (!context.Clients.Any())
        {
            SeedData(context);
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating the database.");
        throw;
    }
}

app.Run();

static void SeedData(ApplicationDbContext context)
{
    // Seed Clients
    var clients = new[]
    {
        new Client { Name = "ABC Corporation", Address1 = "123 Main St", Address2 = "Suite 100", State = "NY", PostCode = "10001" },
        new Client { Name = "XYZ Industries", Address1 = "456 Oak Ave", Address2 = "Floor 5", State = "CA", PostCode = "90001" },
        new Client { Name = "Tech Solutions Ltd", Address1 = "789 Tech Blvd", Address2 = "Building A", State = "CA", PostCode = "94102" },
        new Client { Name = "Global Trading Inc", Address1 = "321 Commerce St", Address2 = "Unit 200", State = "IL", PostCode = "60601" }
    };
    context.Clients.AddRange(clients);

    // Seed Items
    var items = new[]
    {
        new Item { Code = "ITEM001", Description = "Laptop Computer", Price = 999.99m },
        new Item { Code = "ITEM002", Description = "Wireless Mouse", Price = 29.99m },
        new Item { Code = "ITEM003", Description = "Mechanical Keyboard", Price = 149.99m },
        new Item { Code = "ITEM004", Description = "Monitor 27 inch", Price = 299.99m },
        new Item { Code = "ITEM005", Description = "USB-C Cable", Price = 19.99m },
        new Item { Code = "ITEM006", Description = "Webcam HD", Price = 79.99m },
        new Item { Code = "ITEM007", Description = "Headphones", Price = 89.99m },
        new Item { Code = "ITEM008", Description = "External Hard Drive 1TB", Price = 59.99m }
    };
    context.Items.AddRange(items);

    context.SaveChanges();
}

