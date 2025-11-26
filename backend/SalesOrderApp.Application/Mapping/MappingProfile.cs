using AutoMapper;
using SalesOrderApp.Application.DTOs;
using SalesOrderApp.Domain.Entities;

namespace SalesOrderApp.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Client mapping
        CreateMap<Client, ClientDto>().ReverseMap();

        // Item mapping
        CreateMap<Item, ItemDto>().ReverseMap();

        // SalesOrderItem mapping
        CreateMap<SalesOrderItem, SalesOrderItemDto>()
            .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.Item.Code))
            .ForMember(dest => dest.ItemDescription, opt => opt.MapFrom(src => src.Item.Description))
            .ForMember(dest => dest.ItemPrice, opt => opt.MapFrom(src => src.Item.Price));

        // SalesOrder mapping
        CreateMap<SalesOrder, SalesOrderDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name));
    }
}

