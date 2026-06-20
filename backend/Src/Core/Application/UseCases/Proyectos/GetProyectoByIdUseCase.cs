using Application.Common.Exceptions;
using AutoMapper;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.UseCases.Proyectos
{
    public interface IGetProyectoByIdUseCase : IUseCase
    {
        Task<ProyectoDto> Execute(int id);
    }

    public class GetProyectoByIdUseCase : IGetProyectoByIdUseCase
    {

        private readonly IProyectoRepository _repo;
        private readonly IMapper _mapper;

        public GetProyectoByIdUseCase(IProyectoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<ProyectoDto> Execute(int id)
        {
            var proyecto = await _repo.GetByIdAsync(id)
                ?? throw new NotFoundException("Proyecto no encontrado.");

            return _mapper.Map<ProyectoDto>(proyecto);
        }
    }
}
