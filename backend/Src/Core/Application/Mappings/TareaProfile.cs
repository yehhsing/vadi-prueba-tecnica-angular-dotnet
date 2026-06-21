using Application.UseCases.Tareas;
using AutoMapper;
using Domain.Entities;

namespace Application.Mappings;

internal class TareaProfile : Profile
{
    public TareaProfile()
    {
        CreateMap<Tarea, TareaDto>();
    }
}
