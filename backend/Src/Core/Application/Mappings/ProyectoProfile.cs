using Application.UseCases.Proyectos;
using AutoMapper;
using Domain.Entities;

namespace Application.Mappings
{
    internal class ProyectoProfile : Profile
    {
        public ProyectoProfile()
        {
            CreateMap<Proyecto, ProyectoDto>();

            CreateMap<CreateProyectoRequest, Proyecto>();

            CreateMap<UpdateProyectoRequest, Proyecto>();
        }
    }
}
